const fs = require("fs");
const path = require("path").win32;

const FILE = path.join(__dirname, "text.txt");

let readStream = fs.createReadStream(FILE,'utf-8');

readStream.on('data', (chunk) => {
  console.log(chunk);
})
