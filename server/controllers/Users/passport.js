const passport = require("passport");
const FacebookTokenStrategy = require('passport-facebook-token');
const GoogleStrategy = require('passport-token-google2').Strategy
require("dotenv").config();

// FACEBOOK STRATEGY
// const FacebookTokenStrategyCallback = (accessToken, refreshToken, profile, done) => done(null, {
//     accessToken,
//     refreshToken,
//     profile,
// });

// passport.use(new FacebookTokenStrategy({
//     clientID: process.env.FACEBOOK_CLIENT_ID,
//     clientSecret: process.env.FACEBOOK_CLIENT_SECRET
// }, FacebookTokenStrategyCallback));

// GOOGLE STRATEGY
// const GoogleTokenStrategyCallback = (accessToken, refreshToken, profile, done) => {
//     console.log(profile)
//     done(null, {
//     accessToken,
//     refreshToken,
//     profile,
// })};

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
}, (accessToken, refreshToken, profile, done) => {
    console.log("this is in strategy" + profile)
    done(null, {
        accessToken,
        refreshToken,
        profile,
    })
}));

// const authenticateFacebook = (req, res) => new Promise((resolve, reject) => {
//     passport.authenticate('facebook-token', { session: false }, (err, data, info) => {
//         if (err) reject(err);
//         resolve({ data, info });
//     })(req, res);
// });

const authenticateGoogle = (req, res) => new Promise((resolve, reject) => {
    passport.authenticate('google-token',{session: false,scope:[ 'profile','email']}, (err, data, info) => {
        if (err) reject(err)
        resolve({data, info});
    })(req, res);
});

module.exports = {
    // authenticateFacebook,
    authenticateGoogle
}
