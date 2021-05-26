require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const {v4: uuidv4} = require('uuid');
const {AuthenticationError} = require("apollo-server-express");
const {parse} = require('path');
const ExperiencesModel = require('../../datasources/Experiences/Experiences');
const UserModel = require('../../datasources/Users/UserModel');
const createFile = require('../../utils/createFile');
const makeUploadsDir = require('../../utils/createFolder');

cloudinary.config({
    cloud_name: 'liveservers',
    api_key: '247927192671752',
    api_secret: '4m9UW6F9ryn3pPENin5ItnmoETA'
});

class ExperiencesApi {

    // async multiUpload(args){
    //     const {files} = args;
    //     const uploadPath = process.cwd() + "/uploads/" + 'experiences';
    //     makeUploadsDir(uploadPath);
    //     const fileNames = await ExperiencesApi.getFileNameFromUpload(files);
    //     const uploads = await ExperiencesApi.uploadFileToFileSystem(files,uploadPath,fileNames);
    //     Promise.all([uploads])
    //     .then(async()=>{
    //         //lets now upload to cloudinary
    //         let imagesUploadResponse = [];
    //         if (Array.isArray(fileNames) && fileNames.length > 0) {
    //             for (let i = 0; i < fileNames.length; i++) {
    //                 let response = await cloudinary.uploader.upload(`https://d03bc4512c46.ngrok.io/experiences/${fileNames[i]}`, {
    //                     tags: "experiences-uploads"
    //                 })
    //                 imagesUploadResponse.push(response.secure_url)
    //             }
    //         }
    //         console.log(imagesUploadResponse);
    //     })
    //     .catch(e=>{
    //         throw new Error(e.message)
    //     })
    //     return {
    //         status:true,
    //         message:'Successful'
    //     }
    // }

    async createExperience(args,found){
        if(!found){
            throw new Error("Please sign in")
        }
        try{
            const {input:{
                nameOfExperience,
                descriptionOfExperience,
                numberOfPeopleAllowed,
                price,
                imagesOfExperience,
                duration,
                category,
                userBrings,
                datesOfExperience
            }} = args;
            const userResponse = await UserModel.findOne({_id:found._id});

            if(userResponse.host === 0){
                throw new AuthenticationError('You are not authorized to create an experience')
            }

            //lets upload images 😎
            //first create directory for experience images, separate from host or guest
            // const uploadPath = process.cwd() + "/uploads/" + 'experiences/'+found._id;
            // makeUploadsDir(uploadPath);
            // const fileNames = await ExperiencesApi.getFileNameFromUpload(imagesOfExperience);
            // const uploads = await ExperiencesApi.uploadFileToFileSystem(imagesOfExperience, uploadPath, fileNames);
            let a = 1+1;
            Promise.all([a])
                .then(async () => {
                    //lets now upload to cloudinary
                    // let imagesUploadResponse = [];
                    // if (Array.isArray(fileNames) && fileNames.length > 0) {
                    //     for (let i = 0; i < fileNames.length; i++) {
                    //         let response = await cloudinary.uploader.upload(`https://d03bc4512c46.ngrok.io/experiences/${found._id}/${fileNames[i]}`, {
                    //             tags: "experiences-uploads"
                    //         })
                    //         imagesUploadResponse.push(response.secure_url)
                    //     }
                    // }

                    //now we upload to mongodb
                    const experiencesData = new ExperiencesModel({
                        _id: uuidv4(),
                        nameOfExperience,
                        descriptionOfExperience,
                        numberOfPeopleAllowed,
                        price,
                        experienceAuthor:found,
                        // imagesOfExperience: imagesUploadResponse,
                        duration,
                        category,
                        userBrings,
                        datesOfExperience
                    });

                    const response = await experiencesData.save();
                    //remember to return the data uploaded
                    console.log(response)
                    return {
                        status:true,
                        message:"successful"
                    }
                });
        }
        catch(e){
            throw new Error(e.message)
        }
    }

    async fetchAllExperiences(found){
        if(!found){
            throw new AuthenticationError("Please sign in");
        }

        try{
            const response = await ExperiencesModel.find().populate('experienceAuthor').sort({createdAt:-1});
            //remember to return the data uploaded
            console.log(response)
            return {
                status:true,
                message:"Success"
            }

        }catch(e){
            throw new Error(e.message)
        }
    }

    async findExperienceById(args,found){
        if(!found){
            throw new AuthenticationError("Please sign in");
        }
        try{
            const {id} = args;
            const response = await ExperiencesModel.findById({_id:id})
            .populate('experienceAuthor')
            .populate('joinedPeople')
            .sort({createdAt:-1});

            console.log(response);
            return {
                status:true,
                message:"success"
            }
        }catch(e){
            throw new Error(e.message)
        }
    }

    async bookExperience(args,found){
        if(!found){
            throw new Error("Please sign in")
        }

        try{
            //lets get the id of the user
            const {id} = args;
            if(found.host === 1){
                throw new Error("Cannot book own experience")
            }
            await ExperiencesModel.findById({_id:id})
            .exec((err,experiences)=>{
                experiences.joinedPeople.push(found);
                experiences.numberOfPeopleAllowed++;
                const updateUser = new Promise(async(resolve,reject)=>{
                    resolve(await UserModel.updateOne({_id:found._id},{
                        $push: {joinedExperiences:experiences}
                    }))
                })
                Promise.all([experiences.save(),updateUser]);
            });

            //remember to send an email after all these
            return {
                status:true,
                message:"Success"
            }
        }catch(e){
            throw new Error(e.message)
        }
    }

    async leaveExperience(args,found){
        if(!found){
            throw new AuthenticationError("Please sign in")
        }
        try{
            const {id} = args;
            
            const experiencesPromise = new Promise(async(resolve,reject)=>{
                resolve(await ExperiencesModel.updateOne({_id:id},{
                    $pull:{joinedPeople:found},
                    $inc:{numberOfPeopleAllowed:-1}
                }))
            });
            const userPromise = new Promise(async(resolve,reject)=>{
                    resolve(await UserModel.updateOne({_id:found._id},{
                        $pull:{joinedExperiences:id}
                    }))
            });
            Promise.all([experiencesPromise,userPromise])
            return {
                status:true,
                message:"success"
            }
        }
        catch(e){
            throw new Error(e.message)
        }
    }
    async updateExperience(args,found){
        if(!found){
            throw new AuthenticationError("Please sign in")
        }
        try {
            const {input:{
                id,
                nameOfExperience,
                descriptionOfExperience,
                numberOfPeopleAllowed,
                price,
                //imagesOfExperience: imagesUploadResponse,
                duration,
                category,
                userBrings,
                datesOfExperience
            }} = args;
            const result = await ExperiencesModel.findById({_id:id});
            if(found._id === result.experienceAuthor._id){
                const response = await ExperiencesModel.updateOne({_id:id},{
                    $set:{
                        nameOfExperience,
                        descriptionOfExperience,
                        numberOfPeopleAllowed,
                        price,
                        imagesOfExperience: imagesUploadResponse,
                        duration,
                        category,
                        userBrings,
                        datesOfExperience
                    }
                })
            }
            return {
                status:true,
                message:"Success"
            }
        }catch(e){
            throw new Error(e.message)
        }
    }

    async deleteExperience(args,found){
        if(!found){
            throw new AuthenticationError("Please sign in")
        }
        try{
            const {id} = args;
            const response = await ExperiencesModel.findOne({_id:id});
            if(found._id === response.experienceAuthor._id){
                if(response){
                    await ExperiencesModel.deleteOne({_id:response._id});
                }
            }else{
                throw new Error('Not Authorized')
            }
        }catch(e){
            throw new Error(e.message)
        }
    }
    static async getFileNameFromUpload(upload) {
        let names = [];
        for(let i=0;i<upload.length;i++){
            const {filename} = await upload[i];
            names.push(filename);
        }
        return names;
    }

    static generateFilePath(fileName){
        return process.cwd()+"/uploads/" +fileName;
    }

    static uploadFileToFileSystem(upload,path,fileName){
        return new Promise(async(resolve,reject)=>{
            for(let i=0;i<upload.length;i++){
                const {createReadStream} = await upload[i];
                try{
                    resolve(await createFile(
                        createReadStream,
                        fileName[i],
                        path
                    ))
                }
                catch(e){
                    reject("Could not upload file")
                }
            }
        });
    }
}

module.exports = ExperiencesApi;