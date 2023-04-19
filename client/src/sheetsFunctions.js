import { getToken } from "./tokens";

/** Function for fetching Google Sheets data. */

export const getSheetsData = async(SHEET_ID, RANGE) => {
    try {
      const token = await getToken();
      console.log(
          "Getting Google sheets data with token", token
      );
      const request = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await request.json();
      
      if (data.values.length !== 0) { 
        console.log("Got sheets data", data);
        return data.values;
      }
    } catch(error) {
      console.log("Error getting sheets data;", error);
      return error.message;
    }
};

export const addDataToSheets = async(newData, SHEET_ID, ROW) => {
  const token = await getToken();

  const query = `valueInputOption=USER_ENTERED`
  // Note: RAW is an alternate option here

  const url = new URL(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${ROW}:append?${query}`);

  fetch(url.href, {
      method: "POST",
      body: JSON.stringify({ values: newData }),
      headers: {
          Authorization: `Bearer ${token}`,
      }
  })
  .then((res) => res.text())
  .then(console.log)
  .catch(console.error);
};

export const updateSheetsData = async(SHEET_ID, SPECIFIC_SHEET_ID, VALUE, ROW, COLUMN) => {
  const token = await getToken();

  fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}:batchUpdate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      requests: [{
        repeatCell: {
          range: {
            startColumnIndex: COLUMN,
            endColumnIndex: COLUMN+1,
            startRowIndex: ROW,
            endRowIndex: ROW+1,
            sheetId: SPECIFIC_SHEET_ID, 
          },
          cell: {
            userEnteredValue: {
              "numberValue": VALUE
            },
          },
          fields: "*"
        }
      }]
    })
  })
  .catch(console.error);
}

// Special update function for dates specifically.
export const updateDateOnSheets = async(SHEET_ID, SPECIFIC_SHEET_ID, VALUE, ROW, COLUMN) => {
  const token = await getToken();

  fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}:batchUpdate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      requests: [{
        repeatCell: {
          range: {
            startColumnIndex: COLUMN,
            endColumnIndex: COLUMN+1,
            startRowIndex: ROW,
            endRowIndex: ROW+1,
            sheetId: SPECIFIC_SHEET_ID, 
          },
          cell: {
            userEnteredValue: {
              "stringValue": VALUE
            },
          },
          fields: "*"
        }
      }]
    })
  })
  .catch(console.error);
}