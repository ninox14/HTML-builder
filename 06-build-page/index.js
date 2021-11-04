const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path').win32;
const process = require('process');

const projectFolder = path.join(__dirname, 'project-dist');
const stylesFolder = path.join(__dirname, 'styles');
const componentsFolder = path.join(__dirname, 'components');
const templateFile = path.join(__dirname, 'template.html');

const pthCnstr = (filename, folder) => path.join(folder, filename);
let templateData = '';

const readTemplateStream = fs.createReadStream(templateFile, 'utf-8');

readTemplateStream
  .on('data', (chunk) => {
    templateData += chunk;
  })
  .on('end', () => {
    readTemplateStream.close();
  });

readTemplateStream.on('close', async () => {
  const response = await constructHTML();
  response ? console.log(response) : console.log(response, 'not cool');
  // console.log(templateData);
  bundleStyles(stylesFolder, projectFolder);
});

async function constructHTML() {
  const componentFiles = await fsp.readdir(componentsFolder);
  await fsp.mkdir(projectFolder, { recursive: true });
  let response = await getDataAndReplace(componentFiles);

  await fsp.writeFile(pthCnstr('index.html', projectFolder), templateData, 'utf-8');
  return response;
}

async function replaceData(currentData, file) {
  const regx = new RegExp(`{{${path.parse(file).name}}}`, 'gi');
  templateData = templateData.replace(regx, currentData);
  console.log(file, ' replaced');
  return true;
}

async function getDataAndReplace(fileArray) {
  let flags = 0;
  for (let file of fileArray) {
    const data = await fsp.readFile(pthCnstr(file, componentsFolder), {
      encoding: 'utf-8',
    });
    flags += await replaceData(data, file);
  }
  if (flags == fileArray.length) {
    return true;
  } else {
    console.error(new Error(`something wrong ${flags}`));
  }
}

function bundleStyles (srcFolder, destFolder) {
  fs.readdir(srcFolder, { withFileTypes: true }, async (err, files) => {
    if (err) {
      console.error(err);
    }
    const fileNameArr = files.filter(
      (file) => file.isFile() && path.extname(file.name) === '.css'
    );
    const writeStream = fs.createWriteStream(
      pthCnstr('style.css', destFolder),
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
}
