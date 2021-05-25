const {gql} = require("apollo-server-express");

const typeDefs = gql `

    enum ExperiencesCategory{
        SportsAndHealth
        MusicAndDance
        ArtsCraftAndCulture
        Adventure
        NightLifeAndParties
        ImprovMagicAndComedy
        ScifiAndGames
        WellnessAndSpirituality
        FoodAndDrink
        SocialGood
        LecturesAndWorkshops
    }
    type Query{
        simp:Result
        userDetails: [UserDetails]!
        fetchAllExperiences:Result
        findExperienceById(id:String):Result
    }

    type Mutation{
        oauthGoogleResolver(input:GoogleAuth!):Result
        oauthFacebookResolver(input:FacebookAuth!):Result
        signIn(input:SignInInput!):AuthResults!
        signUp(input:SignUpInput!):Result
        logOut:AuthResults
        becomeAHost(input: BecomeHostInput!): Result
        createExperience(input:CreateExperienceInput!):Result
        multiUpload(files:[Upload]):Result
        bookExperience(id:String):Result
        leaveExperience(id:String):Result
    }
    input CreateExperienceInput{
        nameOfExperience:String!
        descriptionOfExperience:String!
        numberOfPeopleAllowed:Int!
        price:String!
        imagesOfExperience:[Upload]
        duration:String!
        category:ExperiencesCategory!
        userBrings:[String]
        datesOfExperience:[String]!
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