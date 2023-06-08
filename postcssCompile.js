// this script gets a scss file name and the target output filename as cli inputs
// and compiles and runs autoprefixer on the scss file and outputs the result to the target file

const fs = require('fs')
const path = require('path')
const postcss = require('postcss')
const autoprefixer = require('autoprefixer')
const sass = require('sass')

const scssFile = process.argv[2]
const targetFile = process.argv[3]

const result = sass.compile(scssFile, {
    loadPaths: [path.dirname(scssFile)],
    style: 'expanded',
})

postcss([autoprefixer()])
    .process(result.css, { from: undefined })
    .then((result) => {
        // write the result to the target file
        fs.writeFile(targetFile, result.css, (error) => {
            if (error) {
                console.error(error)
            }
        })
    })
    .catch((error) => {
        console.error(error)
    })
