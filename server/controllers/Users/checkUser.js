const UserModel = require('../../datasources/Users/UserModel');

module.exports = {
    checkGoogleUser: async function checkGoogleUser({profile, accessToken, refreshToken}){
        console.log(profile)
            let userExist = await UserModel.findOne({email:profile.emails[0].value});
            if(!userExist){
                const newUser = new UserModel({
                    name:profile.displayName || `${profile.familyName} ${profile.givenName}`,
                    email:profile.emails[0].value,
                    'social.google':{
                        id:profile.id,
                        token:accessToken
                    }
                });
                const user = await newUser.save();
                return user;
            }
            return userExist;
    }
}