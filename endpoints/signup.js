var mongoose = require('mongoose');
var User = mongoose.model('User');
var restify = require('restify');
var Responsify = require('../utils/responsify.js')
var Sendmail = require('../utils/sendmail.js')


function failOrMake(req,res,err,users){
		if (err) {Responsify.error(res,new restify.InternalError("Error checking user existance.")); return false;}

		if (users.length>0){
			Responsify.error(res,new restify.InternalError("User already exists."));
		} else{
			//get params
			email = req.params.email
			profile_img = req.params.profile_img
			// pw = req.params.pw
			// username = req.params.username
			school_id = req.params.school
			//check
			if (!email){Responsify.error(res,new restify.MissingParameterError("Missing or empty parameter: email")); return false;}
			if (!profile_img){Responsify.error(res,new restify.MissingParameterError("Missing or empty parameter: profile_img")); return false;}
			// if (!username){Responsify.error(res,new restify.MissingParameterError("Missing or empty parameter: username")); return false;}
			if (!school_id){Responsify.error(res,new restify.MissingParameterError("Missing or empty parameter: school")); return false;}

			//make user
			var user = new User({
				email:email,
				profile_img:profile_img,
				// pw:req.params.pw,
				// username:req.params.username,
				school:school_id
			});
			//make the auth token
			user.auth_token = user.makeAuthToken()

			// console.log(user.formatCompact())
			//save the user
			user.save(function(err){
				if (err) {Responsify.error(res,new restify.InternalError("Error saving user")); return false;}
				Responsify.respond(res,200,user)
				Sendmail.sendmail(user)
			})
			
		}

	}


function signup(req,res) {

	email = req.params.email

	User
	.find({email:email})
	.exec(function(err,users){
		failOrMake(req,res,err,users)
	});

}

module.exports.signup = signup;