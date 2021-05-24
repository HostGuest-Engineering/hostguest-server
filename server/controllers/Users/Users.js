require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const {parse} = require('path');
const UserModel = require("../../datasources/Users/UserModel");
const createFile = require('../../utils/createFile');

cloudinary.config({
    cloud_name: 'liveservers',
    api_key: '247927192671752',
    api_secret: '4m9UW6F9ryn3pPENin5ItnmoETA'
});

class Users {
    async becomeAHost({input:{
        picture,
        hostBrand,
        aboutSelf,
        location
    }
    },found){
        if(!found){
            throw new Error('Please sign in');
        }
        try{
            /**
             * lets first upload the image to file system 
             * then cloudinary and the update the user model
             */
            //console.log(picture,location,aboutSelf,hostBrand)
            const pictureFileName = await Users.getFileNameFromUpload(picture);
            const uploadPath = process.cwd() + "/uploads"
            const pictureUpload = pictureFileName === (null || undefined || "") ? "" : await Users.uploadFileToFileSystem(picture, uploadPath, pictureFileName);
            Promise.all([pictureUpload])
            .then(async()=>{
                const eager_options = {
                    width: 200,
                    height: 150,
                    crop: 'scale',
                    format: 'jpg'
                };
                const userPicturePath = process.cwd()+"/uploads/"+pictureFileName;
                const imageUploadResponse = await cloudinary.uploader.upload(`https://f0c5800dab76.ngrok.io/${pictureFileName}`, {tags: "user-profile-pic",eager: eager_options});
                console.log(imageUploadResponse,found,location,hostBrand);
                const response = await UserModel.updateOne({_id:found._id},{
                    picture:imageUploadResponse.eager[0].secure_url,
                    host:1,
                    description:aboutSelf,
                    location,
                    hostBrand
                });
                console.log(response)
                // return "Success"
            }).catch(e=>{
                throw new Error(e.message)
            })
            return {
                status:true,
                message:"Success"
            }
        }catch(e){
            throw new Error(e.message)
        }
    }

    static async getFileNameFromUpload(upload) {
        const {filename} = await upload;
        const {name,ext} = await parse(filename.toString());
        return `${name}${ext}`;
    }

    static generateFilePath(fileName){
        return process.cwd()+"/uploads/" +fileName;
    }

    static uploadFileToFileSystem(upload,path,fileName){
        return new Promise(async(resolve,reject)=>{
            const {createReadStream} = await upload;
            try{
                resolve(await createFile(
                    createReadStream,
                    fileName,
                    path
                ))
            }
            catch(e){
                reject("Could not upload file")
            }

        });
    }
}

module.exports = Users;
