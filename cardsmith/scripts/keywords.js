import { imgFiles } from "./constants.js";

var data = [
    { name: 'John', age: 30 },
    { name: 'Alice', age: 25 },
    { name: 'Bob', age: 35 }
];

function populateTable() {
    var tableBody = document.getElementById('keyword-table').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    for (const [key, value] of Object.entries(imgFiles)) {
        var row = tableBody.insertRow();
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);

        cell1.innerHTML = key;
        cell2.innerHTML = "<img class='keyword-icon' src='img/symbols/" + value[0] + "' alt='" + key + "'>";
    }
}

populateTable();