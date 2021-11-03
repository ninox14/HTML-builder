const fs = require("fs");
const path = require("path").win32;

const folder = path.join(__dirname, "secret-folder");
const filePath = (filename) => path.join(folder, filename);
const strConstructor = (name, ext, size) => {
  let strSize = size / 1024 > 1 ? `${size / 1024}kb` : `${size}b`;
  return `${name} - ${ext.slice(1)} - ${strSize}`;
};
fs.readdir(folder, { withFileTypes: true }, (err, files) => {
  if (err) {
    console.error(err);
  }
  files
    .filter((file) => file.isFile())
    .map((file) => {
      let ext = path.extname(file.name);
      fs.stat(filePath(file.name), (err, stats) => {
        if (err) {
          console.error(err);
        }
        console.log(
          strConstructor(path.basename(file.name, ext), ext, stats.size)
        );
      });
    });
});
