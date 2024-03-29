const {Schema,model} =require('mongoose');

const experienceSchema = new Schema({
    _id:{
        type:String,
        required:true
    },
    nameOfExperience:{
        type:String,
        required:true
    },
    descriptionOfExperience:{
        type:String,
        required:true
    },
    numberOfPeopleAllowed:{
        type:Number,
        max:45
    },
    peopleWhoBooked:{
        type:Number,
        default:0
    },
    joinedPeople:[
        {
            type:Schema.Types.String,
            ref:'User'
        }
    ],
    price:{
        type:String,
        required:true
    },
    imagesOfExperience:{
        type:[String],
        required:false
    },
    duration:{
        type:String,
        required:false
    },
    category:{
        type:String,
        required:true,
    },
    subcategory: {
        type: String,
        required: true,
    },
    userBrings:{
        type:[String],
    },
    status:{
        type:String,
        default:'pending'
    },
    experienceAuthor:{
        type:Schema.Types.String,
        ref: 'User',
        required:true
    },
    datesOfExperience:[{
        day:String,
        startTime:String,
        endTime:String,
        timeDifference: Number
    }],
    createdAt:{
        type:Date,
        default:Date.now()
    },
    updatedAt:{
        type:Date,
        default:Date.now()
    }
},{timeStamps:true});

const ExperiencesModel = model('Experiences', experienceSchema);

module.exports = ExperiencesModel;