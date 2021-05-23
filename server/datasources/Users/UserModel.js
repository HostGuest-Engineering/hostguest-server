const {Schema,model} = require("mongoose");

const UserSchema = new Schema({
    _id:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    mobile:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    social:{
        google:{
            id:String,
            token:String
        }
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    updatedAt:{
        type:Date,
        default:Date.now()
    }
},{timeStamps:true});

const UserModel = model('User',UserSchema);

module.exports = UserModel;