import { React, useState, useEffect } from "react";
import { addDataToSheets, getSheetsData, updateSheetsData } from "./sheetsFunctions";

import { Button, Card, Form, Input, InputNumber, Dropdown, Empty, Table } from "antd";
import { CaretDownOutlined } from "@ant-design/icons";

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


    const AddStudentForm = () => {
        const onFinish = values => {
            const newUserData = [[values.lastName, values.firstName, 0]]

            addDataToSheets(newUserData, SHEET_ID, "'Livingston Student List'!A3");
            window.location.reload(true);
        }

        const onReset = () => {
            setShowAddForm(false);
        }

        return (
            <>
            <Card
                style={{
                    backgroundColor: "#9DC08B",
                    display: "inline-block",
                    paddingLeft: "300px",
                    paddingRight: "300px"
                }}
            >
                <Form
                    name="addStudentForm"
                    labelCol={{ span: 80 }}
                    wrapperCol={{ span: 10 }}
                    style={{ 
                        maxWidth: 500,
                        textAlign: "left",
                        display: "inline-block",
                        fontFamily: "'Oxygen', sans-serif"
                    }}

                    onFinish={onFinish}
                    autoComplete="off"
                >
                    <h3 style={{ textAlign: "center" }}>Add A Student</h3>
                    <Form.Item
                        wrapperCol={{ span: 12 }}
                        label={ <p style={{ fontFamily: "'Oxygen', sans-serif", fontSize: "15px" }}>
                            First Name
                        </p> }
                        name="firstName"
                        rules={[
                            {
                                required: true,
                                message: "Please enter the student's first name."
                            }
                        ]}
                    >
                        <Input style={{ fontFamily: "'Oxygen', sans-serif" }} />
                    </Form.Item>

                    <Form.Item
                        wrapperCol={{ span: 12 }}
                        label={ <p style={{ fontFamily: "'Oxygen', sans-serif", fontSize: "15px" }}>
                            Last Name
                        </p> }
                        name="lastName"
                        rules={[
                            {
                                required: true,
                                message: "Please enter the student's last name."
                            }
                        ]}
                    >
                        <Input style={{ fontFamily: "'Oxygen', sans-serif" }} />
                    </Form.Item>

                    <Form.Item
                        wrapperCol={{
                            offset: 5,
                            span: 16
                        }}    
                    >
                        <Button type="button" htmlType="submit" className="submitButton"
                        style={{ fontFamily: "'Oxygen', sans-serif" }}>
                            Submit
                        </Button>
                        <Button type="button" htmlType="button" onClick={onReset} className="cancelButton"
                        style={{ fontFamily: "'Oxygen', sans-serif" }}>
                            Cancel
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
            <br></br>
            <br></br>
            </>
        )
    }


    const UpdateStudentForm = () => {
        const [studentName, setStudentName] = useState("");
        const [studentIndex, setStudentIndex] = useState(0);
        
        const items = [];
        for (let i = 0; i < sheetsData.length; i++) {
            items.push({
                label: sheetsData[i][1] + " " + sheetsData[i][0],
                key: i,
            })
        }
        console.log(items);

        const handleMenuClick = e => {
            const nameChoice = sheetsData[e.key][1] + " " + sheetsData[e.key][0];
            console.log(nameChoice);
            console.log(e.key);

            setStudentName(nameChoice);
            setStudentIndex(e.key);
        }

        const menuProps = {
            items,
            onClick: handleMenuClick,
        };
        
        const onFinish = values => {
            if (studentName === "") {
                alert("Please choose a student from the dropdown menu.")
            }
            else {
                console.log("Updating " + studentName + "'s points to " + values.newPoints);

                updateSheetsData(
                    SHEET_ID, LIVINGSTON_SHEET_ID, values.newPoints, parseInt(studentIndex, 10) +2, 2
                );
                window.location.reload(true);
            }
        }

        const onReset = () => {
            setShowUpdatePointsForm(false);
        }

        return (
            <>
            <br></br>
            <br></br>
            <Card
                style={{
                    backgroundColor: "#9DC08B",
                    display: "inline-block",
                    paddingLeft: "300px",
                    paddingRight: "300px",
                }}
            >
                <Form
                    name="updateStudentForm"
                    labelCol={{ span: 80 }}
                    wrapperCol={{ span: 20 }}
                    style={{
                        maxWidth: 600,
                        textAlign: "left",
                        display: "inline-block",
                        fontFamily: "'Oxygen', sans-serif",
                    }}

                    onFinish={onFinish}
                    autoComplete="on"
                >
                    <h3 style={{ textAlign: "center" }}>Update Student Points</h3>
                    <Form.Item
                        wrapperCol={{ span: 12 }}
                        label={ 
                            <p style={{ fontFamily: "'Oxygen', sans-serif", fontSize: "15px" }}>
                                &nbsp;&nbsp;Student's Name
                            </p>
                        }
                    >
                        <Dropdown menu={menuProps} >
                            <Button style={{ fontFamily: "'Oxygen', sans-serif" }}>
                                {studentName !== "" ? studentName : "Select"}
                                <CaretDownOutlined />
                            </Button>
                        </Dropdown>
                    </Form.Item>

                    <Form.Item
                        wrapperCol={{ span: 12 }}
                        label={<p style={{ fontFamily: "'Oxygen', sans-serif", fontSize: "15px" }}>
                            New Point Total
                        </p>}
                        name="newPoints"
                        rules={[
                            {
                                required: true,
                                message: "Please enter the new number of points."
                            }
                        ]}
                    >
                        <InputNumber style={{ fontFamily: "'Oxygen', sans-serif" }} />
                    </Form.Item>

                    <Form.Item
                        wrapperCol={{
                            offset: 4,
                            span: 20
                        }}    
                    >
                        <Button type="button" htmlType="submit" className="submitButton"
                        style={{ fontFamily: "'Oxygen', sans-serif" }}>
                            Submit
                        </Button>
                        <Button type="button" htmlType="button" onClick={onReset} className="cancelButton"
                        style={{ fontFamily: "'Oxygen', sans-serif" }}>
                            Cancel
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
            </>
        )
    }


    const StudentDisplayTable = () => {
        const columns = [
            {
                title: "Last Name",
                dataIndex: "lastName",
                key: "lastName",
            },
            {
                title: "First Name",
                dataIndex: "firstName",
                key: "firstName"
            },
            {
                title: "NP",
                dataIndex: "np",
                key: "np",
                width: "20%"
            }
        ];

        const data = [];
        for (let i = 0; i < sheetsData.length; i++) {
            data.push({
                key: i,
                lastName: sheetsData[i][0],
                firstName: sheetsData[i][1],
                np: sheetsData[i][2],
            })
        }

        return (
            <div className="Table-div">
                <Table className="studentTable" columns={columns} dataSource={data}
                maxWidth="300" size="middle" pagination={false} scroll={{ y: 250 }} />
            </div>
        )
    }


    return(
        <div className="App">
            <h1 style={{ fontSize: "35px" }}>Code Ninjas Livingston</h1>
            {!isLoggedIn ? (
                <button className="loginButton" onClick={createGoogleAuthLink}>Log In</button>
            ) : (
                <>
                <button className="loginButton" onClick={signOut}>Log Out</button>
                <br></br>
                <br></br>

                {showAddForm ? (
                    <AddStudentForm />
                ) : (
                    <button className="addStudentButton"
                    onClick={() => {setShowUpdatePointsForm(false); setShowAddForm(true);}}>
                        Add Student
                    </button>
                )}

                {showUpdatePointsForm ? (
                    <UpdateStudentForm />
                ) : (
                    <button className="updateStudentButton"
                    onClick={() => {setShowAddForm(false); setShowUpdatePointsForm(true);}}>
                        Update Points
                    </button>
                )}
                <br></br>
                <br></br>

                {sheetsData.length === 0 ? (
                    <>
                    <br></br>
                    <Empty 
                        description={<span>No data found.<br></br>Try logging in again.</span>}
                    />
                    </>
                ) : (
                    <StudentDisplayTable />
                )}
                </>
            )}
        </div>
    )
}

export default App;