const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path').win32;

const srcFolder = path.join(__dirname, 'files');
const destFoler = path.join(__dirname, 'files-copy');

const pthCnstr = (filename, folder) => path.join(folder, filename);

function compareFolders(source, dest) {
  const intersection = dest.filter((file) => !source.includes(file));
  if (!intersection[0]) {
    return;
  } else {
    intersection.map((file) => {
      fsp
        .unlink(pthCnstr(file, destFoler))
        .then(() => console.log(file, ' removed'));
    });
  }
}

try {
  fsp.mkdir(destFoler, { recursive: true }).then((dest) => {
    fs.readdir(srcFolder, (err, files) => {
      if (err) {
        console.error(err);
      }
      const fileArray = files;
      fileArray.map((file) => {
        fsp
          .copyFile(
            pthCnstr(file, srcFolder),
            pthCnstr(file, dest ? dest : destFoler)
          )
          .then(() => console.log(`${file} copied`));
      });
      fs.readdir(destFoler, (err, files) => {
        if (err) {
          console.error(err);
        }
        compareFolders(fileArray, files);
      });
    });
  });
} catch (err) {
  console.error(err);
}
