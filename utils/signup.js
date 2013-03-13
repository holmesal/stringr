var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('../models/user.js').make(Schema, mongoose);
var restify = require('restify');
var Responsify = require('./responsify.js')


function failOrMake(req,res,err,user){
		if (err) Responsify.error(res,new restify.InternalError("Error checking user existance."));

		if (users){
			Responsify.error(res,new restify.InternalError("User already exists."));
		} else{
			//create the user
			var user = new User({
				email:req.params.email,
				pw:req.params.pw,
				username:req.params.username
			});
			//make the auth token
			user.auth_token = user.makeAuthToken()
			// console.log(user.formatCompact())
			//save the user
			user.save(function(err){
				if (err) Responsify.error(res,new restify.InternalError("Error saving user"));

				Responsify.respond(res,200,user)
				console.log("everything went okay")
			})
			
		}

	}


function signup(req,res) {

	email = req.params.email
	pw = req.params.pw
	username = req.params.username
	photo = req.params.photo

	User
	.findOne({email:email})
	.exec(function(err,users){
		failOrMake(req,res,err,users)
	});

}

module.exports.signup = signup;