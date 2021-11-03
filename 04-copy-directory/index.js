const fs = require("fs");
const fsp = require('fs/promises');
const path = require("path").win32;

const srcFolder = path.join(__dirname, "files");
const destFoler = path.join(__dirname, "files-copy");

const pthCnstr = (filename, folder) => path.join(folder, filename);

try {
  fsp.mkdir(destFoler, { recursive: true }).then((dest) => {
    fs.readdir(srcFolder, (err, files) => {
      if (err) {
        console.error(err);
      }
      files.map((file) => {
        fsp
          .copyFile(
            pthCnstr(file, srcFolder),
            pthCnstr(file, dest ? dest : destFoler)
          )
          .then(() => console.log(`${file} copied`));
      });
    });
  });
} catch (err) {
  console.error(err);
}

