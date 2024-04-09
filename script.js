document.addEventListener("DOMContentLoaded", function() {
    // Load stored values from localStorage
    loadStoredValues();

    // Fetch data and display in table
    fetchData();

    // Add event listener to swap button
    document.getElementById('swapButton').addEventListener('click', swapValues);
});

function loadStoredValues() {
    const input1 = document.getElementById('input1');
    const input2 = document.getElementById('input2');

    // Retrieve stored values from localStorage
    const storedValue1 = localStorage.getItem('input1');
    const storedValue2 = localStorage.getItem('input2');

    // Set input values if they exist in localStorage
    if (storedValue1) {
        input1.value = storedValue1;
    }
    if (storedValue2) {
        input2.value = storedValue2;
    }

    // Add event listeners to inputs to update localStorage when changed
    input1.addEventListener('input', function() {
        localStorage.setItem('input1', input1.value);
        fetchData(); // Fetch data whenever input changes
    });

    input2.addEventListener('input', function() {
        localStorage.setItem('input2', input2.value);
        fetchData(); // Fetch data whenever input changes
    });
}

function swapValues() {
    const input1 = document.getElementById('input1');
    const input2 = document.getElementById('input2');
    const tempValue = input1.value;

    input1.value = input2.value;
    input2.value = tempValue;

    localStorage.setItem('input1', input1.value);
    localStorage.setItem('input2', input2.value);

    fetchData(); // Fetch data after swapping values
}

function fetchData() {
    clearTable();
    const input1Value = document.getElementById('input1').value;
    const input2Value = document.getElementById('input2').value;

    fetch(`https://meow.suprdory.com:8005/board/${input1Value}/${input2Value}`)
    .then(response => response.json())
    .then(data => {
        displayData(data);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
}

function clearTable(){
    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = ''; // Clear previous data
}

function displayData(data) {
    const tableBody = document.getElementById('table-body');

    const tableHeaders = Object.keys(data[0]); // Get the keys of the first object to use as table headers

    // Dynamically generate table headers
    const headerRow = document.createElement('tr');
    tableHeaders.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    tableBody.appendChild(headerRow);

    // Populate table with data
    data.forEach(item => {
        const row = document.createElement('tr');
        tableHeaders.forEach(header => {
            const td = document.createElement('td');
            td.textContent = item[header];
            row.appendChild(td);
        });
        tableBody.appendChild(row);
    });
}
