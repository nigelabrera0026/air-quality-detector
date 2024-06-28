/******w**************
    
    Assignment 4 Javascript
    Name: Nigel Abrera
    Date: 09/27/2023
    Description: Fetching Data using AJAX

*********************/

// Loads the load function when the page is refreshed.
document.addEventListener("DOMContentLoaded", load);

/**
 * Executes when the page is load
 */
function load() {
    let sortation = document.getElementById("sort");
    let display = document.getElementById("display");
    let searchForm = document.getElementById("searchForm");
    let searchInput = document.getElementById("search");
    let searchInputValue = searchInput.value.trim();

    // Default function call
    fetchData(display.value, sortation.value);

    // If sortation is selected and changed either asc or desc
    sortation.addEventListener("change", function () {
        let selectedSort = sortation.value;

        if (searchInputValue !== "") {
            clearTable();
            let searchData = pascalCase(searchInput.value.trim());
            fetchData(display.value, selectedSort,  searchData);

        } else {
            clearTable();
            fetchData(display.value, selectedSort );
        }
        
    });

    // If display is changed with values 40, 60, 100, 120
    display.addEventListener("change", function () {
        let selectedDisplay = display.value;

        if (searchInputValue !== "") {
            clearTable();
            let searchData = pascalCase(searchInput.value.trim());
            fetchData(selectedDisplay, sortation.value, searchData);

        } else {
            clearTable();
            fetchData(selectedDisplay, sortation.value);
        }
    });

    searchForm.addEventListener("submit", function (event) {
        event.preventDefault(); // prevent default of the page
        clearTable(); // Clear the table
            
        // Fetch data with the search input
        let searchData = pascalCase(searchInput.value.trim());
        fetchData(display.value, sortation.value, searchData);
    });
}

/**
 * Fetching the API's Data to be shown in the table.
 * @param {String} countLimit Sets how many to display in the table.
 * @param {String} sortation Defines if it is ASC or DESC
 * @param {String} searchResult Searching the result of a specific location.
 */
async function fetchData(countLimit, sortation, searchResult) { 
    // API to be fetched
    let apiUrl;

    // Defining if the link needs to be filtered with a search result or not
    if(searchResult == undefined) { 
        apiUrl = `https://data.winnipeg.ca/resource/f58p-2ju3.json?$order=observationid ${sortation}&$limit=${countLimit}`;

    } else {
        apiUrl = `https://data.winnipeg.ca/resource/f58p-2ju3.json?$where=locationname LIKE '%${searchResult}%'&$order=observationid ${sortation}&$limit=${countLimit}`;
    }

    const encodedURL = encodeURI(apiUrl); // Encoding modified url to be fetched

    fetch(encodedURL)
        .then(result => {
            return result.json();
        })
        .then(data => {
            organizeData(data);
        })
        .catch(error => { // Prompts HTTP Error
            let mainBody = document.getElementById("wrapper");
            let h1 = document.createElement("h1");
            h1.innerHTML += error;
            mainBody.appendChild(h1);
        });
}

/**
 * Organizing data from the fetched data
 * @param {JSON} data Organizes the data to be placed in the table.
 */
function organizeData(data) {
    // Generate the data itself
    let tableBody = document.getElementById("tBody");

    for (let i = 0; i < data.length; i++) { // i will loop through each
        // Create new row for each object
        let dataRow = document.createElement("tr");
        const dataKeys = Object.keys(data[i]);

        // looping through the keys of the current object
        for (let j = 0; j < dataKeys.length; j++) {
            const key = dataKeys[j];
            const value = data[i][key];

            let td = document.createElement("td");

            // Handle "location" and "point" objects
            if (key == "location") {
                const coords = `(${value.latitude}, ${value.longitude})`;
                td.innerHTML = coords;
                dataRow.appendChild(td);

            } else if (key == "point") {
                const pointCoord = `${ i + 1} POINT (${value.coordinates[1]}, ${value.coordinates[0]})`;
                td.innerHTML = pointCoord;
                dataRow.appendChild(td);
            
            } else if ( // Exclude these keys
                key !== ":@computed_region_66r8_mmhg" &&
                key !== ":@computed_region_6rfj_69jf" &&
                key !== ":@computed_region_38v8_cedi"
                ) 
            {
                // Create tds for each value
                td.textContent = value;
                dataRow.appendChild(td);

            } else {
                continue; // Continue the loop
            }
        }
        tableBody.appendChild(dataRow);
    }
}

/**
 * Clears the table's body
 * @returns cleared table
 */
function clearTable() {
    let tableBody = document.getElementById("tBody");

    while (tableBody.firstChild) {
        tableBody.removeChild(tableBody.firstChild);
    }
}

/**
 * Makes the first letter of each word capital
 * @param {String} word The sentence or word to be processed
 * @returns word that is now in pascal case
 */
function pascalCase(word) {
    let filtration = word.split(" ");

    for (let i = 0; i < filtration.length; i++) {
        filtration[i] = filtration[i][0].toUpperCase() + filtration[i].substr(1);

    }
    return filtration.join(" ");
}