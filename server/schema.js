const {gql} = require("apollo-server-express");

const typeDefs = gql `

    type Query{
        simp:Result
        userDetails: [UserDetails]!
        fetchAllExperiences:[FetchExperiencesResult]!
        findExperienceById(id:String):FindSingleExperience!
    }

    type Mutation{
        oauthGoogleResolver(input:GoogleAuth!):Result
        oauthFacebookResolver(input:FacebookAuth!):Result
        signIn(input:SignInInput!):AuthResults!
        signUp(input:SignUpInput!):Result
        logOut:AuthResults
        becomeAHost(input: BecomeHostInput!): Result
        createExperience(input:CreateExperienceInput!):CreateExperienceResponse!
        multiUpload(files:[Upload]):Result
        bookExperience(id:String):Result
        leaveExperience(id:String):Result
    }
    input CreateExperienceInput{
        detailsOfExperience:DetailsOfExperienceInput!
        imagesOfExperience:[Upload]!
        
    }
    input DetailsOfExperienceInput{
        duration:String!
        category:String!
        userBrings:[String]
        datesOfExperience:[String]!
        nameOfExperience:String!
        descriptionOfExperience:String!
        numberOfPeopleAllowed:Int!
        price:Int!
        subcategory:String!
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
    type CreateExperienceResponse{
        joinedPeople:[String]
        imagesOfExperience:[String]
        userBrings:[String]
        status:String
        datesOfExperience:[String]
        createdAt:String
        _id:String
        nameOfExperience:String
        descriptionOfExperience:String
        numberOfPeopleAllowed:Int
        price:String
        duration:String
        category:String
        subcategory:String
        experienceAuthor:String
    }
    type FetchExperiencesResult{
        joinedPeople:[String]
        imagesOfExperience:[String]
        userBrings:[String]
        status:String
        datesOfExperience:[String]
        createdAt:String
        updatedAt:String
        _id:String
        nameOfExperience:String
        descriptionOfExperience:String
        numberOfPeopleAllowed:Int
        price:String
        experienceAuthor:ExperienceCreator!
        duration:String
        category:String
        subcategory:String
    }
    type ExperienceCreator {
        host: Int
        _id: String
        name: String
        email: String
        mobile: String
        description: String
        hostBrand: String
        location: String
        picture: String
    }
    type FindSingleExperience{
        joinedPeople:[JoinedPeopleResult]!
        imagesOfExperience:[String]
        userBrings:[String]
        status:String
        datesOfExperience:[String]
        createdAt:String
        updatedAt:String
        _id:String
        nameOfExperience:String
        descriptionOfExperience:String
        numberOfPeopleAllowed:Int
        price:String
        experienceAuthor:ExperienceCreator!
        duration:String
        category:String
        subcategory:String
    }
    type JoinedPeopleResult {
        host:String
        joinedExperiences:[String]
        _id:String
        name:String 
        email:String
        mobile:String
    }
`;

module.exports = typeDefs;
