import { React, useState, useEffect } from "react";
import { addDataToSheets, getSheetsData, updateSheetsData } from "./sheetsFunctions";

import './App.css';

/**
 * A very simple version of the app for Code Ninjas in Livingston.
 * It reads data from the spreadsheet (its own separate sheet), but the only functionality provided 
 * is updating a student's points.
 */
function App() {
    const SHEET_ID = "1fGaEXUdjP10QJUR4BvSyGcUXWPi_bNzwxvHgZkLM1A8";
    const LIVINGSTON_SHEET_ID = "1959907638";
    const RANGE = "'Livingston Student List'!A3:E";

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [sheetsData, setSheetsData] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showUpdatePointsForm, setShowUpdatePointsForm] = useState(false);
    
    useEffect(() => {
        handleTokenFromQueryParams();
        
        getSheetsData(SHEET_ID, RANGE)
          .then(data => {
            const updatedData = data.filter((student) => {
              return (student[0] !== " " && student[1] !== " ")
            })
            setSheetsData(updatedData);
          })
          .catch(error => {console.log(error)})
    }, []);
    
    
    const createGoogleAuthLink = async () => {
        try {
          const request = await fetch("http://localhost:8080/createAuthLink", {
            method: "POST",
          });
          const response = await request.json();
    
          window.location.href = response.url;
        } catch (error) {
          console.log("Error", error);
          throw new Error("Issue with Login", error.message);
        }
    };
    
    const handleTokenFromQueryParams = () => {
        const query = new URLSearchParams(window.location.search);
        
        const accessToken = query.get("accessToken"); 
        const refreshToken = query.get("refreshToken");
        const expirationDate = newExpirationDate();
    
        console.log("Expiration Date:", expirationDate);
        if (accessToken && refreshToken) {
          storeTokenData(accessToken, refreshToken, expirationDate);
          setIsLoggedIn(true);
          sessionStorage.setItem("isLoggedIn", true);
        }
    };

    const newExpirationDate = () => {
        var expiration = new Date();
        expiration.setHours(expiration.getHours() + 1);
        return expiration;
    };
    
    const storeTokenData = async (token, refreshToken, expirationDate) => {
        sessionStorage.setItem("accessToken", token);
        sessionStorage.setItem("refreshToken", refreshToken);
        sessionStorage.setItem("expirationDate", expirationDate);
    };
    
    const signOut = () => {
        setIsLoggedIn(false);
        sessionStorage.clear();
        window.location.href=('/');
    };


    const AddUserForm = () => {
        const [firstName, setFirstName] = useState("");
        const [lastName, setLastName] = useState("");

        const handleSubmit = event => {
            event.preventDefault();

            if (firstName != "" && lastName != "") {
                const newUserData = [[lastName, firstName, 0]]

                addDataToSheets(newUserData, SHEET_ID, "'Livingston Student List'!A3");

                window.location.reload(true);
            }
            else {
                alert("Please fill out all fields.");
            }
        }

        return (
            <div>
                <h4>Add Student</h4>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Last Name:&nbsp;&nbsp;</label>
                        <input 
                            type="text"
                            name="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                        <br></br>
                        <label>First Name:&nbsp;&nbsp;</label>
                        <input 
                            type="text"
                            name="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                        <br></br>
                        <button type="submit">Submit</button>
                        <button onClick={() => {setShowAddForm(false)}}>Cancel</button>
                    </div>
                </form>
            </div>
        )
    }


    const UpdateUserForm = () => {
        const [fullName, setFullName] = useState("");
        const [newPoints, setNewPoints] = useState("");

        const handleSubmit = event => {
            event.preventDefault();

            if (fullName !== "" && newPoints !== "") {
                console.log("Updating " + fullName + "'s points to " + newPoints)

                for (let i = 0; i < sheetsData.length; i++) {
                    const lastName = sheetsData[i][0];
                    const firstName = sheetsData[i][1];

                    if (fullName.trim() === (firstName + " " + lastName)) {
                        updateSheetsData(SHEET_ID, LIVINGSTON_SHEET_ID, newPoints, i+2, 2);
                        break;
                    }
                }
            }
            else {
                alert("Please fill out all fields.");
            }

            window.location.reload(true);
        }

        return (
            <div className="update-user-form-container">
                <h4>Update User</h4>
                <form onSubmit={handleSubmit}>
                    <div className="internal-update-form-container">
                        <label>Student's Name:&nbsp;&nbsp;</label>
                        <input 
                            type="text"
                            name="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />
                        <br></br>
                        <label>New Point Total:&nbsp;&nbsp;</label>
                        <input 
                            type="float"
                            name="newPoints"
                            value={newPoints}
                            onChange={e => setNewPoints(e.target.value)}
                        />
                        <br></br>
                        <button className="update-user-submit-button" type="submit">Submit</button>
                        <button
                            className="cancel-update-user-button"
                            onClick={() => {setShowUpdatePointsForm(false)}}>
                                Cancel
                        </button>
                    </div>
                </form>
                <br></br>
            </div>
        )
    }

    return(
        <div className="App">
            <h1 style={{ fontSize: "35px" }}>Code Ninjas Livingston Points App</h1>
            {!isLoggedIn ? (
                <button onClick={createGoogleAuthLink}>Log In</button>
            ) : (
                <>
                <button onClick={signOut}>Log Out</button>
                <br></br>

                {showAddForm ? (
                    <AddUserForm />
                ) : (
                    <button onClick={() => {setShowUpdatePointsForm(false); setShowAddForm(true);}}>
                        Add Student
                    </button>
                )}

                {showUpdatePointsForm ? (
                    <UpdateUserForm />
                ) : (
                    <button onClick={() => {setShowAddForm(false); setShowUpdatePointsForm(true);}}>
                        Update Points
                    </button>
                )}

                <table>
                    <tbody>
                        <tr>
                            <th>Last Name</th>
                            <th>First Name</th>
                            <th>NP</th>
                        </tr>
                        {sheetsData.map((item, i) => (
                            <tr key={i}>
                                <td>{item[0]}</td>
                                <td>{item[1]}</td>
                                <td>{item[2]}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </>
            )}
        </div>
    )
}

export default App;