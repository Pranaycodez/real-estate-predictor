const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');


const excelFilePath = path.join(__dirname, 'real_estate_dataset.xlsx');
const jsonFilePath = path.join(__dirname, '../src/data/real_estate_dataset.json');

const workbook = xlsx.readFile(excelFilePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const jsonData = xlsx.utils.sheet_to_json(sheet);

fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2));

console.log('Excel data converted to JSON successfully.');
