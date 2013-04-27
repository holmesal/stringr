var mongoose = require('mongoose');
var restify = require('restify');
var async = require('async');
var User = mongoose.model('User');
var PhotoString = mongoose.model('PhotoString');
var Responsify = require('../utils/responsify.js');

// function deepPopulate(user){
// 	var opts = {
//     path: 'school following followers'
//     , select: 'domain long_name short_name email full_name profile_img school strings_count strings blurb following followers'
//     }
// 	User.populate(user.following,opts,function(err,following){
// 		console.log("deep populating")
// 		user.following[i] = following
// 		console.log(following)
// 	})
// }

function everythingIsOkay(req,res,err,user,callback){
	if (err){Responsify.error(res,new restify.InternalError("Error populating user.")); return false;}

	callback(req,res,user)
}

function failOrCallback(req,res,err,user,callback){
	if (err){Responsify.error(res,new restify.InternalError("DB error finding user.")); return false;}

	if (!user){
		Responsify.error(res,new restify.InternalError("Invalid auth code or email"));
	} else{

		callback(req,res,user)

		// async.parallel([
		//     function(){
		//     	console.log("populating photos")
		//     	var opts = {
		//         path: 'photos'
		// 		, select: 'comments likes'
		// 	    }
		// 	    for (var i = 0; i < user.strings.length; i++) {
		// 	    	PhotoString.populate(user,opts,function(err,user){
		// 	    	console.log(user)
		// 	    	// Responsify.respond(res,200,user)
		// 	    })
		// 	    };
		    	
		//     },
		//     // function(){ ... }
		// // ], everythingIsOkay(req,res,err,user,callback));
		// ], callback(req,res,user));
		// 
		// 
		// 
		// callback(req,res,user)
		// var opts = {
	 //        path: 'following'
	 //      , select: 'domain long_name short_name email full_name profile_img school strings_count strings blurb following followers'
	 //    }
	 //    User.populate(user,opts,function(err,user){
	 //    	console.log("RESULT:")
	 //    	console.log(user)
	 //    	callback(req,res,user)
	 //    })
	    // console.log(user.following)
	    // console.log("starting async")
	    // async.each(user.following,deepPopulate,function(err){
	    // 	console.log("finished")
	    // 	console.log(err)
	    // })
	    // for (var i = 0; i < user.following.length; i++) {
		   //  User.populate(user.following,opts,function(err,following){
		   //  	console.log("deep populating")
		   //  	user.following[i] = following
		   //  	console.log(following)
		   //  	// var opts = {
		   //   //    path: 'school following followers'
			  //   //   , select: 'domain long_name short_name email full_name profile_img school strings_count strings blurb following followers'
			  //   // }
			  //   // User.populate(user.following,opts,function(err,sub){
			  //   // 	console.log(sub)
			  //   // 	
			    
			    	
			  //   // })
		   //  })
		// }
		// console.log("and here's the result:")
		// console.log(user.following)
		// callback(req,res,user)
	}
}

function Authenticate(req,res,callback,heavy,populate){

	//post data is only in params, get param is in both .query and .params
	auth_token = req.params.auth_token
	email = req.params.email

	if (!auth_token){Responsify.error(res,new restify.NotAuthorizedError("You must pass an auth_token parameter.")); return false;}
	if (!email){Responsify.error(res,new restify.NotAuthorizedError("You must pass a email parameter.")); return false;}
	//heavy is optional and defaults to false
	heavy = (typeof heavy === "undefined") ? false : heavy;
	//populate is optional and defaults to true
	populate = (typeof populate === "undefined") ? true : populate;

	userquery = User.findOne({email:email,auth_token:auth_token})

	if (heavy==false){
		//light stuff only
		userquery.select("email full_name profile_img school strings_count strings blurb following followers likes")
	} else{
		//everything
		userquery.select("email full_name profile_img school strings_count strings blurb following followers likes verified email")
	}

	if (populate==true){
		userquery
		.populate('school')
		.populate('following','email full_name profile_img school strings_count strings blurb following followers')
		.populate('followers','email full_name profile_img school strings_count strings blurb following followers')
		.populate('strings','photos tags title description')
		.populate('likes','likes comments')
	}

	// User
	// .findOne({email:email,auth_token:auth_token})
	// .select(toSelect)
	userquery
	.exec(function(err,user){
		failOrCallback(req,res,err,user,callback)
	})
}

module.exports.Authenticate = Authenticate;