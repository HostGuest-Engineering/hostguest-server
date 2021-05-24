const {gql} = require("apollo-server-express");

const typeDefs = gql `
    type Query{
        simp:Result
        userDetails: [UserDetails]!
    }

    type Mutation{
        oauthGoogleResolver(input:GoogleAuth!):Result
        oauthFacebookResolver(input:FacebookAuth!):Result
        signIn(input:SignInInput!):AuthResults!
        signUp(input:SignUpInput!):Result
        logOut:AuthResults
        becomeAHost(input: BecomeHostInput!): Result
    }
    input BecomeHostInput{
        picture: Upload!
        hostBrand: String!
        location: String!
        aboutSelf: String!
    }
    input SignInInput {
        password:String!
        email:String!
    }
    input SignUpInput{
        email:String!
        password:String!
        mobile:String!
        firstName:String!
        lastName:String!
        confirmPassword:String!
    }
    input GoogleAuth {
        token:String!
    }
    input FacebookAuth{
        token:String!
    }
    type Result {
        status:String
        id:String
        message:String
        token:String
    }
    type AuthResults{
        status:String
        id:String
        message:String
        token:String
    }
    type UserDetails {
        name:String!
        email:String!
        mobile:String!
    }
`;

module.exports = typeDefs;