const fs = require('fs');
const path = require('path').win32;
const process = require('process');
const readline = require('readline');

const file = path.join(__dirname, 'file.txt');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let stream = fs.createWriteStream(file);

rl.question('Do you like what you see?\n', (answer) => {
  if (answer.toLowerCase() == 'exit') {
    process.exit(0);
  }
  stream.write(answer);
});
rl.on('line', (line) => {
  if (line.toLowerCase() == 'exit') {
    process.exit(0);
  }
  stream.write('\n' + line);
});
process.on('exit', () => {
  console.log('Without furhter interruption lets celebrate and suck some ...!');
});
