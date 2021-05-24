const fs = require('fs');

const makeUploadsDir = (uploadsDir)=>{
    try{
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir);
        }
    }
    catch(e){
        const customerMessage = "Sorry, we were unable to create the folder" ;
        throw new Error(customerMessage);
    }
    
}

module.exports = makeUploadsDir;