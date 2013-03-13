var mongoose = require('mongoose');
var User = mongoose.model('User');
var restify = require('restify');
var Responsify = require('../utils/responsify.js');
var Sendmail = require('../utils/sendmail.js')

function resend(req,res,user){
	//called by the authenticator function
	console.log("Resend request")
	Sendmail.sendmail(user)
	Responsify.respond(res,200,user)
}

function confirm(req,res){
	user_id = req.params.user_id
	verify_key = req.params.verify_key
	console.log("Confirm request")
	
	User
	.findOne({_id:user_id,auth_token:verify_key})
	.exec(function(err,user){
		confirmOrFail(req,res,err,user)
	})
}

function confirmOrFail(req,res,err,user){
	if (err) {Responsify.error(res,new restify.InternalError("DB error finding user.")); return false;}

	if (!user){
		Responsify.error(res,new restify.InternalError("No users with that id/verify key combination were found"));
	} else{
		user.verified = true
		user.save(function(err){
			if (err) {Responsify.error(res,new restify.InternalError("Error saving user")); return false;}
			console.log("user saved")
		})
		Responsify.respond(res,200,user)
	}
}


module.exports.resend = resend;
module.exports.confirm = confirm;