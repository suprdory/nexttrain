log = console.log
let lastUpdateTime = 0
document.addEventListener("DOMContentLoaded", function () {
    // Load stored values from localStorage
    loadStoredValues();

    // Fetch data and display in table
    fetchData();

    // Add event listener to swap button
    document.getElementById('swapButton').addEventListener('click', swapValues);
});
setInterval(display_last_updated, 1000)
let stations = [];

// Load JSON dataset
fetch('stations.json')
    .then(response => response.json())
    .then(data => {
        stations = data; // Assuming the JSON is an array of station objects
    });

function loadStoredValues() {
    const input1 = document.getElementById('input1');
    const input2 = document.getElementById('input2');
    const crs1 = document.getElementById('crs1');
    const crs2 = document.getElementById('crs2');

    // Retrieve stored values from localStorage
    const storedValue1 = JSON.parse(localStorage.getItem('input1'));
    const storedValue2 = JSON.parse(localStorage.getItem('input2'));
    log(storedValue1)

    // Set input values if they exist in localStorage
    if (storedValue1) {
        input1.value = `${storedValue1.name} (${storedValue1.crs})`;
        crs1.value = storedValue1.crs;
    }
    if (storedValue2) {
        input2.value = `${storedValue2.name} (${storedValue2.crs})`;
        crs2.value = storedValue2.crs;
    }

    // // Add event listeners to inputs to update localStorage when changed
    // input1.addEventListener('input', function () {
    //     // this.value = this.value.toUpperCase();
    //     // localStorage.setItem('input1', this.value);
    //     // fetchData(); // Fetch data whenever input changes
    // });

    // input2.addEventListener('input', function () {
    //     this.value = this.value.toUpperCase();
    //     localStorage.setItem('input2', this.value);
    //     // fetchData(); // Fetch data whenever input changes
    // });
}

function swapValues() {
    const input1 = document.getElementById('input1');
    const input2 = document.getElementById('input2');
    const crs1 = document.getElementById('crs1');
    const crs2 = document.getElementById('crs2');

    const tempValue = input1.value;
    const tempCrsValue = crs1.value;

    input1.value = input2.value;
    input2.value = tempValue;

    crs1.value = crs2.value;
    crs2.value = tempCrsValue;

    const store1 = localStorage.getItem('input1');
    const store2 = localStorage.getItem('input2');
    localStorage.setItem('input1', store2);
    localStorage.setItem('input2', store1);

    fetchData(); // Fetch data after swapping values
}

function fetchData() {
    lastUpdateTime = 0;
    display_last_updated()
    clearTable();
    clearNames();
    const input1Value = document.getElementById('crs1').value;
    const input2Value = document.getElementById('crs2').value;

    fetch(`https://meow.suprdory.com:8005/board/${input1Value}/${input2Value}`)
        // fetch(`http://192.168.1.10:8000/board/${input1Value}/${input2Value}`)
        .then(response => response.json())
        .then(data => {
            console.log(data)
            displayData(data);


        })
        .catch(error => {
            console.error('Error fetching data:', error);
            displayDataError()

        });
}

function clearTable() {
    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = ''; // Clear previous data
}
function displayNames(name1, name2) {
    const names = document.getElementById('station_names');
    names.textContent = name1 + ' → ' + name2;

}
function display_last_updated() {
    const updated = document.getElementById('last_updated');
    if (lastUpdateTime == 0) {
        updated.textContent = 'Updating...';
    }
    else {
        let currentTime = Date.now()
        let timeSinceUpdate = (currentTime - lastUpdateTime)
        let timeSinceUpdateString = msecsToString(timeSinceUpdate)
        updated.textContent = 'Last Updated ' + timeSinceUpdateString + ' ago.';
    }
}


function clearNames() {
    const names = document.getElementById('station_names');
    names.textContent = '';
}
function displayDataError() {
    const names = document.getElementById('station_names');
    names.textContent = 'Error fetching data.';
    lastUpdateTime = Date.now()
    display_last_updated()
}
function displayNoTrains() {
    const names = document.getElementById('station_names');
    names.textContent = 'There are no trains.';
}

function displayData(data) {
    lastUpdateTime = Date.now()
    clearTable();
    if (data.board.length == 0) {
        displayNoTrains()
    }
    else {
        displayNames(data.from_station, data.to_station);
        const tableBody = document.getElementById('table-body');
        const tableHeaders = Object.keys(data.board[0]); // Get the keys of the first object to use as table headers

        // Dynamically generate table headers
        const headerRow = document.createElement('tr');
        tableHeaders.forEach(header => {
            const th = document.createElement('th');
            let headerTxt = header
            if (header == 'Est' || header == 'Stat') {
                headerTxt = 'Status'
            }
            if (header == 'Final') {
                headerTxt = 'Final Dest'
            }

            th.textContent = headerTxt;
            headerRow.appendChild(th);
        });
        tableBody.appendChild(headerRow);

        // Populate table with data
        data.board.forEach(item => {
            const row = document.createElement('tr');
            tableHeaders.forEach(header => {
                const td = document.createElement('td');
                td.textContent = item[header];
                if (item['Est'] != 'On time' & header == 'Dep') {
                    td.classList.add("delayed");
                }
                if (item['Stat'] != 'On time' & header == 'Arr') {
                    td.classList.add("delayed");
                }

                row.appendChild(td);

            });
            tableBody.appendChild(row);
        });
    }

    display_last_updated()

}

function msecsToString(mseconds) {

    // var seconds = Math.floor((new Date() - date) / 1000);
    var seconds = mseconds / 1000
    var interval = seconds / 31536000;

    if (interval > 1) {
        return Math.floor(interval) + " years";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
        return Math.floor(interval) + " months";
    }
    interval = seconds / 86400;
    if (interval > 1) {
        return Math.floor(interval) + " days";
    }
    interval = seconds / 3600; //hours
    if (interval > 1.5) {
        return Math.round(interval) + " hours";
    }
    // if (interval > 10) {
    //     return Math.round(interval) + " hour";
    // }
    interval = seconds / 60; // minutes
    if (interval > 2) {
        return Math.floor(interval) + " minutes";
    }
    if (seconds < 1) {
        return "0 seconds";
    }
    if (seconds < 2) {
        return "1 second";
    }
    return Math.floor(seconds) + " seconds";
}
// Function to filter stations based on input
function searchStations(inputEl, resultsEl, crsEl) {
    // log(inputEl)
    const input = document.getElementById(inputEl).value.toLowerCase();
    const resultsDiv = document.getElementById(resultsEl);
    resultsDiv.innerHTML = ""; // Clear previous results

    if (input.length === 0) {
        resultsDiv.style.display = "none";
        return;
    }

    // First prioritize matches that start with the search term
    const exactMatches = stations.filter(station =>
        station.name.toLowerCase().startsWith(input) || station.crs.toLowerCase().startsWith(input)
    );

    // Then get partial matches that include the search term (but don't start with it)
    const partialMatches = stations.filter(station =>
        (station.name.toLowerCase().includes(input) || station.crs.toLowerCase().includes(input)) &&
        !(station.name.toLowerCase().startsWith(input) || station.crs.toLowerCase().startsWith(input))
    );

    const allMatches = [...exactMatches, ...partialMatches];  // Combine results

    if (allMatches.length > 0) {
        resultsDiv.style.display = "block";
        allMatches.forEach(station => {
            const resultDiv = document.createElement("div");
            resultDiv.innerHTML = `${station.name} (${station.crs})`;
            resultDiv.onclick = function () {
                document.getElementById(inputEl).value = `${station.name} (${station.crs})`;
                document.getElementById(crsEl).value = `${station.crs}`;
                localStorage.setItem(inputEl, JSON.stringify(station));
                log('localset', JSON.parse(localStorage.getItem(inputEl)));
                resultsDiv.style.display = "none";
                fetchData();
            };
            resultsDiv.appendChild(resultDiv);
        });
    } else {
        resultsDiv.style.display = "none";
    }
}