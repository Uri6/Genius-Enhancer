// find every sass file in the project, and run the postcssCompile script on it

const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
    // get all files in the directory
    fs.readdirSync(dir).forEach((file) => {
        // get the full path of the file
        const filePath = path.join(dir, file);
        // get the file's stats
        const fileStat = fs.statSync(filePath);
        // if the file is a directory, recurse into it
        if (fileStat.isDirectory()) {
            filelist = walkSync(filePath, filelist);
        } else {
            // if the file is a scss file, add it to the list
            if (path.extname(filePath) === '.scss') {
                filelist.push(filePath);
            }
        }
    })
    return filelist;
}

// get all the scss files in the project
const scssFiles = walkSync(__dirname);

const child_process = require('child_process');

// for each scss file, run the postcssCompile script on it
scssFiles.forEach((scssFile) => {
    console.log(`:compile ${scssFile}`);
    const targetFile = scssFile.replace('.scss', '.css');
    child_process.execSync(`node postcssCompile.js ${scssFile} ${targetFile}`);
})
