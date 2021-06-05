require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const {v4: uuidv4} = require('uuid');
const {AuthenticationError} = require("apollo-server-express");
const shortId = require("shortid");
const path = require('path');
const {format} = require("date-fns");
const ExperiencesModel = require('../../datasources/Experiences/Experiences');
const UserModel = require('../../datasources/Users/UserModel');
const createFile = require('../../utils/createFile');
const makeUploadsDir = require('../../utils/createFolder');
const generatePdf = require('../../utils/generatePdf');

cloudinary.config({
    cloud_name: 'liveservers',
    api_key: '247927192671752',
    api_secret: '4m9UW6F9ryn3pPENin5ItnmoETA'
});

class ExperiencesApi {

    async createExperience(args,found){
        if(!found){
            throw new Error("Please sign in")
        }
        try{
            const {input:{
                imagesOfExperience,
                detailsOfExperience:{
                    descriptionOfExperience,
                    numberOfPeopleAllowed,
                    price,
                    nameOfExperience,
                    category,
                    userBrings,
                    datesOfExperience,
                    subcategory
                }
            }} = args;

            if(found.host === 0){
                throw new AuthenticationError('You are not authorized to create an experience')
            }

            //lets upload images 😎
            //first create directory for experience images, separate from host or guest
            const uploadPath = process.cwd() + "/uploads/" + 'experiences';
            makeUploadsDir(uploadPath);
            const fileNames = await ExperiencesApi.getFileNameFromUpload(imagesOfExperience);
            const uploads = await ExperiencesApi.uploadFileToFileSystem(imagesOfExperience, uploadPath, fileNames);
            let imagesUploadResponse = [];
            let response = {};
            let uniqueNumber = shortId.generate();
            Promise.all([uploads])
                .then(async () => {
                    //lets now upload to cloudinary
                    if (Array.isArray(fileNames) && fileNames.length > 0) {
                        for (let i = 0; i < fileNames.length; i++) {
                            let response = await cloudinary.uploader.upload(`${process.env.PATH_TO_EXPERIENCE_IMAGE_UPLOAD}/experiences/${fileNames[i]}`, {
                                tags: "experiences-uploads"
                            })
                            imagesUploadResponse.push(response.secure_url)
                        }
                    }
                    
                 })
                 .then(async()=>{
                     //now after uploading images to cloudinary, we then create the experience
                     //now we upload to mongodb
                     const experiencesData = new ExperiencesModel({
                         _id: uuidv4(),
                         nameOfExperience,
                         descriptionOfExperience,
                         numberOfPeopleAllowed,
                         price:price.toString(),
                         experienceAuthor:found,
                         imagesOfExperience: imagesUploadResponse,
                         category,
                         userBrings,
                         datesOfExperience,
                         subcategory,
                         uniqueNumber
                     });

                     response = await experiencesData.save();
                     console.log(response)
                     // //remember to return the data uploaded
                 })
                 .then(async()=>{
                     //generate and send pdf
                    const printData = {
                        hostGuestExperience:{
                            descriptionOfExperience,
                            numberOfPeopleAllowed,
                            price,
                            nameOfExperience,
                            category,
                            userBrings:(Array.isArray(userBrings) && userBrings.length > 0) ? userBrings.map(item=>ExperiencesApi.addKey(item)):[],
                            datesOfExperience,
                            subcategory,
                            uniqueNumber,
                            userName:found.name,
                            date:format(new Date(),'dd MMM yyyy'),
                            userEmail:found.email,
                            userMobileNo:found.mobile,
                            logo:process.env.HOSTGUEST_LOGO
                        }
                    }
                    const pdfName = "HostGuestExperienceCreation.pdf";
                    const outputPath = path.resolve(path.join(process.cwd(),"uploads"));
                    const htmlContent = path.resolve('./server/utils/template.html');
                    console.log(outputPath,htmlContent);
                    await generatePdf(htmlContent,printData,pdfName,outputPath);
                 })
                 .catch(e=>{
                     throw new Error(e.message)
                 })
                 return response;
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
            const response = await ExperiencesModel.find().populate('experienceAuthor').populate('joinedPeople').sort({createdAt:-1});
            return response;

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
            return response;
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
            /**
             * dates is an array containing dates booked/selected by the guest
             */
            const {id,dates} = args;
            if(found.host === 1){
                throw new Error("Cannot book own experience")
            }

            await ExperiencesModel.findById({_id:id})
            .exec((err,experiences)=>{
                experiences.joinedPeople.push(found);
                experiences.peopleWhoBooked++;
                const updateUser = new Promise(async(resolve,reject)=>{
                    resolve(await UserModel.updateOne({_id:found._id},{
                        $push: {
                            datesAttending: dates,
                            joinedExperiences: experiences
                        }
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
                    $inc:{peopleWhoBooked:-1}
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
                subcategory,
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
                        subcategory,
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

    static addKey(item){
        return {
            key:item
        }
    }
}

module.exports = ExperiencesApi;