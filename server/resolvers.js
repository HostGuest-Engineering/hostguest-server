const resolvers = {
    Query:{
        simp:(_,__,{dataSources,found})=>dataSources.sessionApi.simp(found),
        userDetails:(_,__,{dataSources,found})=>dataSources.sessionApi.userDetails(found),
    },
    Mutation:{
        oauthGoogleResolver:(_,args,{dataSources,req,res})=>dataSources.sessionApi.oauthGoogleResolver(args,req,res),
        oauthFacebookResolver:(_,args,{dataSources,req,res})=>dataSources.sessionApi.oauthFacebookResolver(args,req,res),
        signIn:(_,args,{dataSources,res})=>dataSources.sessionApi.signIn(args,res),
        signUp:(_,args,{dataSources})=>dataSources.sessionApi.signUp(args),
        logOut:(_,__,{dataSources,res})=>dataSources.sessionApi.logOut(res),
        becomeAHost:(_,args,{dataSources,found})=>dataSources.userApi.becomeAHost(args,found),
    }
}

module.exports = resolvers;