const express = require('express');
const {ApolloServer} = require('apollo-server-express');
const cors = require('cors');
const path = require('path');
const cookieParser = require("cookie-parser");
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const mongoose = require('mongoose');
const helmet = require('helmet');
const expressJwt = require('express-jwt');
const app = express();
const {Session,Users,ExperiencesApi} = require("./controllers");
const UserModel = require('./datasources/Users/UserModel');
const makeUploadsDir = require('./utils/createFolder');

require('dotenv').config();
const configValues = process.env;

//create uploads dir if none exist
const uploadsDir = `${process.cwd()}/uploads`;
makeUploadsDir(uploadsDir);
app.use(express.static(path.join(process.cwd(),'uploads')));
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
            console.log('Connected successfully to our datasource');
        } catch (e) {
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

const server = new ApolloServer({
    typeDefs,
    resolvers,
    dataSources: () => {
       return { 
           sessionApi:new Session(),
           userApi:new Users(),
           experiencesApi: new ExperiencesApi()
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