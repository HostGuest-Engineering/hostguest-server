// const UserModel = require("./datasources/Users/UserModel");
// require("dotenv").config();

// const getUser = async req => {
//     const user = req.user || "";
//     let found ;
//     if(user){
//         found = await UserModel.findOne({_id:req.user.id});
//         return found;
//         console.log("this in found 1 " + found)
//     }
//     // console.log("this in found 2 " + found)
//     // return found;
// };

// module.exports = getUser;

const {AuthenticationError} = require("apollo-server-express");
const jwt = require('jsonwebtoken');
require('dotenv').config();

const getUser = async req => {
        const authToken = req.headers.authorization || "";
        if (!authToken) {
            throw new AuthenticationError("Token required");
        }
        const token = authToken.split("Bearer ")[1];
        if (!token) throw new AuthenticationError('You should provide a token!');
        if (token) {
            console.log(token)
            try {
                return await jwt.verify(token, process.env.SECRET);
            } catch (e) {
                throw new AuthenticationError(
                    e.message
                );
            }
        }
};

module.exports = getUser;