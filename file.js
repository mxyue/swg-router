let fs = require('fs')

function _getJsFiles(filePaths, baseDir) {
  let filenames = fs.readdirSync(baseDir)
  filenames.forEach(filename =>{
    if(filename.endsWith('.js')){
      filePaths.push(`${baseDir}/${filename}`)
    }else if(fs.lstatSync(`${baseDir}/${filename}`).isDirectory()){
      _getJsFiles(filePaths, `${baseDir}/${filename}`)
    }
  })
}

class Util{
  static getJsPaths(path){
    let filePaths = []
    _getJsFiles(filePaths, path)
    return filePaths
  }
}

module.exports = Util