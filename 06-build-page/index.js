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
  bundleStyles(stylesFolder, projectFolder);

  copyFolder(
    pthCnstr('assets', __dirname),
    path.join(__dirname, 'project-dist', 'assets')
  );
});

async function constructHTML() {
  const componentFiles = await fsp.readdir(componentsFolder);
  await fsp.mkdir(projectFolder, { recursive: true });
  let response = await getDataAndReplace(componentFiles);

  await fsp.writeFile(
    pthCnstr('index.html', projectFolder),
    templateData,
    'utf-8'
  );
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

function bundleStyles(srcFolder, destFolder) {
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

async function copyFolder(targetPath, destPath) {
  await fsp.mkdir(destPath, { recursive: true });
  const folderContent = await fsp.readdir(targetPath, { withFileTypes: true });
  for (let file of folderContent) {
    if (file.isDirectory()) {
      copyFolder(
        path.join(targetPath, file.name),
        path.join(destPath, file.name)
      );
    } else {
      await fsp.copyFile(
        pthCnstr(file.name, targetPath),
        pthCnstr(file.name, destPath)
      );
      console.log(file.name, 'copied');
    }
  }
  const destContent = await fsp.readdir(destPath, { withFileTypes: true });
  compareFolders(folderContent, destContent, destPath);
}

function compareFolders(source, dest, destFolder) {
  const sourceNamesArr = source.map((file) => (file = file.name));
  const destNamesArr = dest.map((file) => (file = file.name));
  const intersection = destNamesArr.filter(
    (file) => !sourceNamesArr.includes(file)
  );
  if (!intersection[0]) {
    return;
  } else {
    intersection.map((file) => {
      fsp
        .unlink(pthCnstr(file, destFolder))
        .then(() => console.log(file, ' removed'));
    });
  }
}
