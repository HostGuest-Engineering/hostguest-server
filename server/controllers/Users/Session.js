const jwt = require('jsonwebtoken');
const {v4: uuidv4} = require('uuid');
const bcrypt = require('bcrypt');
const {AuthenticationError,UserInputError} = require('apollo-server-express');
const {
    authenticateFacebook,
    authenticateGoogle
}= require('./passport');
require('dotenv').config();
const UserModel = require("../../datasources/Users/UserModel");
// const CheckUsers = require('./checkUser');

class Session {
    async simp(found){
        // const user = getUser(req);
        if(!found){
            throw new AuthenticationError("Please sign in")
        }
        return {
            message:"Successfully set up server"
        }
    }

    async signUp({input:{
        password,email,firstName,lastName,confirmPassword,mobile
    }}){
        try{
            const response = await UserModel.findOne({email:email});
        
            if(response){
              throw new UserInputError('Email already in use')
            }
            
            if(password.length < 8){
                throw new UserInputError('Password must be greater than 8 characters long');
            }

            if(password.length !== confirmPassword.length && password !== confirmPassword){
                throw new UserInputError('Passwords do not match');
            }
            const name = firstName + " " + lastName;
             const newUser = new UserModel({
                 _id:uuidv4(),
                 name,
                 email,
                 mobile
             });

            const hash = await bcrypt.hash(password, 10);
            
    
            newUser.password = hash;
            const user = await newUser.save();
            const token = jwt.sign({email:user.email,id:user._id},process.env.SECRET,{expiresIn: '1d'});
            return {
                status:true,
                message:"Successfully signed up",
                token
            }
        }catch(e){
            console.log(e);
            throw new Error(e.message)
        }
    }

    async signIn({input:{
        email,
        password
    }},res){
        try {
            const response =  await UserModel.findOne({email:email})

                if(!response){
                    throw new UserInputError('No such email registered')
                }

                const match = await bcrypt.compare(password,response.password);

                if(!match){
                    throw new UserInputError('Passwords do not match')
                }

                const token= jwt.sign({email:response.email,id:response._id},process.env.SECRET,{expiresIn: '1d'});

                res.cookie('host', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production", //on https
                    maxAge:1000 * 60 * 60 * 24 * 1,
                    sameSite:process.env.NODE_ENV === "production" ? "none" :"strict"
                    //domain: 'example.com', //set your domain
                });
                // console.log("in resolver" + res.cookie)
                return {
                    status:true,
                    id:response._id,
                    message:"Successfully authenticated",
                    token:token
                };
        }catch(e){
            console.log(e);
            throw new Error(e.message)
        }

    }

    async logOut(res){
        try{
            res.clearCookie("host",{
                path:"/",
                // sameSite:"none"
            })
            return {
                status:true,
                message:"successfully logged you out"
            }
        }catch(err){
            return {
                status: false,
                message: "failed to log you out"
            }
        }
    }

    async userDetails(found){
        if(!found){
            throw new AuthenticationError("Please sign in");
        }
        const response = await UserModel.findOne({_id:found._id});
        return [response]
    }

    async oauthGoogleResolver(args,req,res){
        console.log(args)
        const {input:{token}} = args;
        req.body = {
            ...req.body,
            access_token: token
        };
        try {
            const {data,info} = await authenticateGoogle(req, res);
            console.log("this is in resolver" + data + info)
            // if (data) {
            //     const user = CheckUsers.checkGoogleUser(data);
            //     console.log("this is after create" + user)
            //     let oken = '';
            //     if(user){
            //         //generateJWT
            //         oken = jwt.sign({
            //             email: user.email,
            //             // id: user.social.google.id
            //         }, process.env.SECRET, {
            //             expiresIn: '1d'
            //         });
            //     }
                 

            //      return {
            //          status: true,
            //         //  id: user.social.google.id,
            //          oken
            //      };
            // }
            return {
                status: true,
            };
        }catch (e) {
            throw new Error(e.message)
        }
    }

    // async oauthFacebookResolver(args,req,res){
    //     console.log(args)
    //     const {input:{token}} = args;
    //     req.body = {
    //         ...req.body,
    //         access_token: token
    //     };
    //     try {
    //         const {data} = await authenticateFacebook(req, res);
    //         console.log("this is in resolver" + data)
    //         // if (data) {
    //         //     const user = CheckUsers.checkGoogleUser(data);
    //         //     console.log("this is after create" + user)
    //         //     let oken = '';
    //         //     if(user){
    //         //         //generateJWT
    //         //         oken = jwt.sign({
    //         //             email: user.email,
    //         //             // id: user.social.google.id
    //         //         }, process.env.SECRET, {
    //         //             expiresIn: '1d'
    //         //         });
    //         //     }
                 

    //         //      return {
    //         //          status: true,
    //         //         //  id: user.social.google.id,
    //         //          oken
    //         //      };
    //         // }
    //         return {
    //             status: true,
    //         };
    //     }catch (e) {
    //         throw new Error(e.message)
    //     }
    // }
}

module.exports = Session;
