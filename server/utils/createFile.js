const {createWriteStream} = require("fs");
const path = require("path");

const createFile = (createReadStream,newFileName,uploadPath)=>{

     new Promise((resolve,reject)=>{
        try{
        return resolve(createReadStream().pipe(createWriteStream(path.join(uploadPath,newFileName))))
        }
        catch(e){
            reject(e);
        }
    })
}

module.exports = createFile;