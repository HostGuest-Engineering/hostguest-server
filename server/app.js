const express = require('express');
const {
    ApolloServer,
} = require('apollo-server-express');
const cors = require('cors');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
const cookieParser = require("cookie-parser");
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const mongoose = require('mongoose');
const passport = require('passport');
const helmet = require('helmet');
//const Logger = require('./utils/logger');
const expressJwt = require('express-jwt');
const app = express();
const {Session} = require("./controllers");
const UserModel = require('./datasources/Users/UserModel');

require('dotenv').config();
const configValues = process.env;

const listOfOriginsAllowed = process.env.ORIGIN.split(',');

const options = {
    origin: function (origin, callback) {
        if (!origin) {
            callback(null, true)
        } else {
            if (listOfOriginsAllowed.indexOf(origin) !== -1) {
                callback(null, true)
            } else {
                callback(new Error('Not allowed by CORS'))
            }
        }
    },
    credentials:true
};

app.use(cors(options));
app.use(helmet({
    contentSecurityPolicy: (process.env.NODE_ENV === 'production') ? undefined : false
}));

(
    async function(){
        try {
            await mongoose.connect(configValues.DB_CONNECTION_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            // Logger.log(
            //     'info',
            //     'Success', {
            //         message: 'Connected successfully to our datasource'
            //     }
            // )
            console.log('Connected successfully to our datasource');
        } catch (e) {
            // Logger.log(
            //     'error',
            //     'Error', {
            //         message: e.message
            //     }
            // )

            throw new Error('Could not connect, please contact us if problem persists');
        }
    }
)()

app.use(cookieParser());
app.use(expressJwt({
    secret:process.env.SECRET,
    algorithms:["HS256"],
    getToken: req => req.cookies.host,
    credentialsRequired:false
}))
// passport.use(new GoogleStrategy({
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     // callbackURL: "http://localhost:5002/success"
// }, (accessToken, refreshToken, profile, done) => {
//     console.log(profile)
//     done(null, {
//         accessToken,
//         refreshToken,
//         profile,
//     })
// }));
// app.use(passport.initialize());
// app.get('/login',passport.authenticate('google',{ scope: ['profile'],session:false }));
// app.get('/success', passport.authenticate('google', {
//             session: false
//         }), (req, res) => {
//     res.send('succussful')
// })

const server = new ApolloServer({
    typeDefs,
    resolvers,
    dataSources: () => {
       return { 
           sessionApi:new Session(),
        }
    },
    context:async({req,connection,res})=>{
        if (connection) {
            return connection.context;
        }else{
        let user = req.user || "";
        let found;
        if (user){
            found = await UserModel.findOne({
                _id: req.user.id
            });
        }
        return {req,res,found};
    }

    },
    formatError:(err)=>({
        message:err.message
    }),
    introspection: process.env.NODE_ENV !== 'production',
    playground: process.env.NODE_ENV !== 'production',
});



server.applyMiddleware({app,cors:false})

app.listen(configValues.PORT,()=>console.log(`🚀 Server ready at http://localhost:${configValues.PORT}${server.graphqlPath}`));

module.exports = app;