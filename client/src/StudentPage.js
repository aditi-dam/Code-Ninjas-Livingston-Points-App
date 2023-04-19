import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getSheetsData, updateDateOnSheets, updateSheetsData } from "./sheetsFunctions";

import { FaHome } from "react-icons/fa";
import { AiOutlineStar } from "react-icons/ai";
import { AiFillStar } from "react-icons/ai";

import "./App.css"
import BadgePage from "./BadgePage";
import { updateTotalNinjaPoints } from "./updateTotalNinjaPoints";
import ProgressReportPage from "./ProgressReportPage";

/** Individual student page layout. */
function StudentPage() {
    const params = useParams();
    const row = parseInt(params.id, 10) + 1; // The '10' is for base-10
    
    const SHEET_ID = "1fGaEXUdjP10QJUR4BvSyGcUXWPi_bNzwxvHgZkLM1A8";
    const RANGE1 = "'Main Student List'!A" + row + ":B" + row;
    const RANGE2 = "'Assignment List'!A2:D";

    const RANGE3 = "'Student Assignments'!B" + row + ":E" + row;
    // The "E" is temporary; will need to be changed once all assignments are added
    const studentProgressSheetId = 634308377; // From spreadsheet, end of url #gid=

    const [assignmentData, setAssignmentData] = useState([]); 
    
    /* These disable the warnings on the next line. */
    // eslint-disable-next-line
    const [whiteBelt, setWhiteBelt] = useState([]); // eslint-disable-next-line
    const [yellowBelt, setYellowBelt] = useState([]); // eslint-disable-next-line
    const [orangeBelt, setOrangeBelt] = useState([]); // eslint-disable-next-line
    const [greenBelt, setGreenBelt] = useState([]); // eslint-disable-next-line
    const [blueBelt, setBlueBelt] = useState([]); // eslint-disable-next-line
    const [purpleBelt, setPurpleBelt] = useState([]); // eslint-disable-next-line
    const [brownBelt, setBrownBelt] = useState([]); // eslint-disable-next-line
    const [redBelt, setRedBelt] = useState([]); // eslint-disable-next-line
    const [blackBelt, setBlackBelt] = useState([]); 

    const orderedBeltList = {'White': whiteBelt, 'Yellow': yellowBelt, 'Orange': orangeBelt,
                            'Green': greenBelt, 'Blue': blueBelt, 'Purple': purpleBelt,
                            'Brown': brownBelt, 'Red': redBelt, 'Black': blackBelt};
    const dict = Object.keys(orderedBeltList);

    const [currentBeltView, setCurrentBeltView] = useState(whiteBelt);
    const [starRecords, setStarRecords] = useState([]);

    const [showBadgePage, setShowBadgePage] = useState(false);
    const [showReportPage, setShowReportPage] = useState(false);

    useEffect(() => {
        for (const [key, value] of Object.entries(orderedBeltList)) {
            if (key === sessionStorage.getItem("currentBelt")) {
                setCurrentBeltView(value);
            }
        }

        // Get this student's data
        getSheetsData(SHEET_ID, RANGE1)
        .then(data => {
            setAssignmentData(data);
        })
        .catch(error => {console.log(error)})

        // Get full assignment list
        getSheetsData(SHEET_ID, RANGE2)
        .then(data => {
            while (whiteBelt.length) { whiteBelt.pop(); }
            while (yellowBelt.length) { yellowBelt.pop(); }
            while (orangeBelt.length) { orangeBelt.pop(); }
            while (greenBelt.length) { greenBelt.pop(); }
            while (blueBelt.length) { blueBelt.pop(); }
            while (purpleBelt.length) { purpleBelt.pop(); }
            while (brownBelt.length) { brownBelt.pop(); }
            while (redBelt.length) { redBelt.pop(); }
            while (blackBelt.length) { blackBelt.pop(); }

            for (let array = 0; array < data.length; array++) {
                const assignment = data[array];

                if (assignment[0] === "White") {
                    whiteBelt.push(assignment);
                } else if (assignment[0] === "Yellow") {
                    yellowBelt.push(assignment);
                } else if (assignment[0] === "Orange") {
                    orangeBelt.push(assignment);
                } else if (assignment[0] === "Green") {
                    greenBelt.push(assignment);
                } else if (assignment[0] === "Blue") {
                    blueBelt.push(assignment);
                } else if (assignment[0] === "Purple") {
                    purpleBelt.push(assignment);
                } else if (assignment[0] === "Brown") {
                    brownBelt.push(assignment);
                } else if (assignment[0] === "Red") {
                    redBelt.push(assignment);
                } else if (assignment[0] === "Black") {
                    blackBelt.push(assignment);
                }
            }
        })
        .catch(error => {console.log(error)})

        // Get student's personal assignments
        getSheetsData(SHEET_ID, RANGE3)
        .then(data => {
            while (starRecords.length) {
                starRecords.pop();
            }
            setStarRecords(data);
        })
        .catch(error => {console.log(error)})

        updateTotalNinjaPoints(row);
    }, [])

    const redirectHome = () => {
        sessionStorage.removeItem("currentBelt")
        window.location.href=(
          '/?accessToken=' + sessionStorage.getItem("accessToken").toString() 
          + '&refreshToken=' + sessionStorage.getItem("refreshToken").toString()
        );
    }

    const findAssignmentIndex = (initialIndex) => {
        var sum = 0;
        var beltPos = 0;
        
        // Find the position of the current belt in the ordered dictionary
        for (var index = 0; index < dict.length; index++) {
            if (dict[index] === currentBeltView[0][0]) {
                beltPos = index;
            }
        }

        // Add the number of assignments from all the belts that come before it
        for (var a = 0; a < beltPos; a++) {
            sum += orderedBeltList[dict[a]].length;
        }

        // Add this to the index passed (0, 1, etc.) to account for the buffer
        // of prior assignments. Otherwise, it would just take the numbers for
        // white belt by default because those are the first columns in Student Assignments.
        return (sum + initialIndex);
    }

    const displayStars = (totalNumber, i) => {
        var returnList = [];
        var actualReturnList = []; // Will contain the actual stars
        var earnedStars = 0;
        
        // If no stars earned yet and the values on the 
        // spreadsheet are blank, adjust accordingly
        if (starRecords[0].length > 1) {
            earnedStars = starRecords[0][i];
        }

        // More if cases to make it work right
        if (i > 3) {
            earnedStars = 0;
        }

        if (earnedStars > 0) {
            for (var j = 0; j < earnedStars; j++) {
                returnList.push("filled");
            }
        }

        if (totalNumber !== earnedStars) {
            for (var k = 0; k < (totalNumber - earnedStars); k++) {
                returnList.push("empty");
            }
        }


        var filledStarCount = 0;

        for (let m = 0; m < returnList.length; m++) {
            if (returnList[m] === "filled") {
                filledStarCount++;
                actualReturnList.push(
                    <AiFillStar 
                        key={"filled star, index " + m} 
                        onClick={() => emptyStar(i, filledStarCount)} 
                    />
                );
            }
            else if (returnList[m] === "empty") {
                actualReturnList.push(
                    <AiOutlineStar 
                        key={"empty star, index " + m} 
                        onClick={() => fillStar(m+1, i)} 
                    />
                );
            }
        }
        // Note about arrow function syntax in general:
        // It is used to prevent an onClick() from triggering without being clicked.

        return (<p>{actualReturnList}</p>);
    }

    const emptyStar = (column, totalStars) => {
        updateSheetsData(
            SHEET_ID, studentProgressSheetId, totalStars-1, row-1, column+1
        );

        const currentDate = new Date().toLocaleDateString();
        updateDateOnSheets(SHEET_ID, 0, currentDate, row-1, 4);

        specialReload();
    }

    const fillStar = (starNumber, column) => {
        updateSheetsData(
            SHEET_ID, studentProgressSheetId, starNumber, row-1, column+1
        );

        const currentDate = new Date().toLocaleDateString();
        updateDateOnSheets(SHEET_ID, 0, currentDate, row-1, 4);
        
        specialReload();
    }

    const specialReload = () => {
        var saveKey = "White";

        for (const [key, value] of Object.entries(orderedBeltList)) {
            if (value === currentBeltView) {
                saveKey = key;
            }
        }
        
        sessionStorage.setItem("currentBelt", saveKey);
        console.log(sessionStorage.getItem("currentBelt"))

        window.location.reload(true);
    }

    const evaluateCurrentPoints = (item, i) => {
        // Multiply points per star by the number of stars the student has for that assignment
        
        if (item[3] !== null && !isNaN(starRecords[0][findAssignmentIndex(i)])) {
            const array = item[3].split(",")
            const starCount = starRecords[0][findAssignmentIndex(i)]
            
            var sum = 0;

            for (let j = 0; j < starCount; j++) {
                sum += parseInt(array[j], 10)
            }

            return sum;
        }
        else {
            return 0;
        }
    }


    return (
        <div className="StudentPage" style={{textAlign: "center", margin: "0px" }}>
            <button className="home-button" onClick={redirectHome}>
                <FaHome style={{ height: "30px", width: "30px" }} />
            </button>
            <br></br>

            <button 
                style={{ margin: "5px" }} 
                onClick={() => {
                    setShowBadgePage(false); 
                    setShowReportPage(false);
                }}>Stars</button>
            <button 
                style={{ margin: "5px" }} 
                onClick={() => {
                    setShowBadgePage(true);
                    setShowReportPage(false);
                }}>Badges</button>
            <button 
                style={{ magrin: "5px" }} 
                onClick={() => {
                    setShowReportPage(true);
                    setShowBadgePage(false);
                }}>Progress Reports</button>

            {(assignmentData.length > 0) ? (
                <h2>{assignmentData[0][1]} {assignmentData[0][0]}</h2>
            ) : (
                <p>No data for this student.</p>
            )}

            <br></br>

            {(showBadgePage || showReportPage) ? (
                <>
                {(showBadgePage) ? (
                    <BadgePage row />
                ) : (
                    <ProgressReportPage row />
                )}
                </>
            ) : (
               <>
                <button className="belt-button" title="View White Belt Assignments" 
                    onClick={() => {setCurrentBeltView(whiteBelt)}}>
                        White
                    </button>
                <button className="belt-button" title="View Yellow Belt Assignments" 
                    onClick={() => {setCurrentBeltView(yellowBelt)}}>
                        Yellow
                    </button>
                <button className="belt-button" title="View Orange Belt Assignments" 
                    onClick={() => {setCurrentBeltView(orangeBelt)}}>
                        Orange
                    </button>
                <button className="belt-button" title="View Green Belt Assignments" 
                    onClick={() => {setCurrentBeltView(greenBelt)}}>
                        Green
                    </button>
                <button className="belt-button" title="View Blue Belt Assignments" 
                    onClick={() => {setCurrentBeltView(blueBelt)}}>
                        Blue
                    </button>
                <button className="belt-button" title="View Purple Belt Assignments"
                    onClick={() => {setCurrentBeltView(purpleBelt)}}>
                        Purple
                    </button>
                <button className="belt-button" title="View Brown Belt Assignments"
                    onClick={() => {setCurrentBeltView(brownBelt)}}>
                        Brown
                    </button>
                <button className="belt-button" title="View Red Belt Assignments"
                    onClick={() => {setCurrentBeltView(redBelt)}}>
                        Red
                    </button>
                <button className="belt-button" title="View Black Belt Assignments"
                    onClick={() => {setCurrentBeltView(blackBelt)}}>
                        Black
                    </button>

                <p>
                    Click on an empty star to <strong>fill</strong> all stars up to and including that one. 
                    <br></br> 
                    Click on a full star to <strong>empty</strong> one star from that row of stars.
                </p>
                <br></br>

                {(currentBeltView.length > 0) ? (
                    <table className="assignment-table">
                        <tbody>
                            <tr>
                                <th 
                                    className="assignment-row"
                                    style={{ paddingRight: "2cm" }}
                                    >
                                        Assignment
                                    </th>
                                <th className="assignment-row">Stars</th>
                                <th className="assignment-row">Points Earned</th>
                            </tr>
                            {currentBeltView.map((item, i) => (
                                <tr key={i}>
                                    <td className="assignment-row">{item[1]}</td>
                                    <td 
                                        className="assignment-row"
                                        style={{ paddingRight: "1.5cm" }}
                                        >
                                            {displayStars(item[2], findAssignmentIndex(i))}
                                        </td>
                                    <td className="assignment-row">
                                        {evaluateCurrentPoints(item, i)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>Assignment list data not found.</p>
                )}
               </> 
            )}

            <br></br>

        </div>
    );
}

export default StudentPage;