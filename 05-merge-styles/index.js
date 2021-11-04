const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path').win32;
const process = require('process');

const srcFolder = path.join(__dirname, 'styles');
const destFolder = path.join(__dirname, 'project-dist');
const pthCnstr = (filename, folder) => path.join(folder, filename);

fs.readdir(srcFolder, { withFileTypes: true }, async (err, files) => {
  if (err) {
    console.error(err);
  }
  const fileNameArr = files.filter(
    (file) => file.isFile() && path.extname(file.name) === '.css'
  );
  const writeStream = fs.createWriteStream(
    pthCnstr('bundle.css', destFolder),
    'utf-8'
  );
  fileNameArr.map((file) => {
    const readStream = fs.createReadStream(pthCnstr(file.name, srcFolder));
    readStream.on('data', (data) => {
      writeStream.write(data);
    });
  });
  console.log('done?');
});
