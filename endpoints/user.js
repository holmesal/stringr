var mongoose = require('mongoose');
var restify = require('restify');
var User = mongoose.model('User');
var PhotoString = mongoose.model('PhotoString');
var Responsify = require('../utils/responsify.js');
var async = require('async');

function populatePhotos(item,callback){
	PhotoString.populate(item,"photos",function(){
		callback()
	})
}

function getUserRespond(req,res,err,user){
	if (err) {Responsify.error(res,new restify.InternalError("DB error finding user.")); return false;}

	if (!user){
		Responsify.error(res,new restify.InternalError("No users with that username were found"));
	} else{
		async.each(user.strings,populatePhotos,function(){
			Responsify.respond(res,200,user)
		})
	}
}

function getUser(req,res){
	username = req.params.username

	User
	.findOne({username:username})
	.select('username full_name profile_img school strings_count strings blurb following followers')
	.populate('school')
	.populate('strings')
	.populate('following','username full_name profile_img school strings_count strings blurb following followers')
	.populate('followers','username full_name profile_img school strings_count strings blurb following followers')
	.lean()
	.exec(function(err,user){
		getUserRespond(req,res,err,user)
	})
}

function getSelf(req,res,user){
	//called by the authenticator function
	async.each(user.strings,populatePhotos,function(){
		Responsify.respond(res,200,user)
	})
}

function follow(req,res,user){
	//called by the authenticator function
	tofollow_id = req.params.tofollow
	if (!tofollow_id){Responsify.error(res,new restify.MissingParameterError("You must pass the user to follow: /user/{id}/follow")); return false;}
	if (tofollow_id==user._id){Responsify.error(res,new restify.InternalError("You cannot follow yourself. This would create an infinite loop that would go on forever. Do you know what sort of dark forces you're messing with here? I mean, do you?")); return false;}
	
	User
	.findOne({_id:tofollow_id})
	.exec(function(err,tofollow){
		followUser(req,res,err,user,tofollow)
	})
}

function followUser(req,res,err,user,tofollow){
	if (!tofollow){
		Responsify.error(res,new restify.InternalError("No users with that username were found"));
	} else if (tofollow.followers.indexOf(user._id) != -1){
		Responsify.respond(res,200)
	}else{
		tofollow.followers.push(user)
		tofollow.save(function(err){
			if (err) {Responsify.error(res,new restify.InternalError("Error updating user to follow")); return false;}
			console.log("user added to followers ok")
		})
		user.following.push(tofollow)
		user.save(function(err){
			if (err) {Responsify.error(res,new restify.InternalError("Error updating following user")); return false;}
			console.log("tofollow added to following ok")
		})

		Responsify.respond(res,200)
	}

}

function unfollow(req,res,user){
	//called by the authenticator function
	tounfollow_id = req.params.tounfollow
	if (!tounfollow_id){Responsify.error(res,new restify.MissingParameterError("You must pass the user to unfollow: /user/{id}/unfollow")); return false;}

	User
	.findOne({_id:tounfollow_id})
	.exec(function(err,tounfollow){
		unfollowUser(req,res,err,user,tounfollow)
	})
}

function unfollowUser(req,res,err,user,tounfollow){

	tounfollow.followers.splice(tounfollow.followers.indexOf(user._id), 1);
	tounfollow.save(function(err){
		if (err) {Responsify.error(res,new restify.InternalError("Error updating user to unfollow")); return false;}
		console.log("user removed from followers ok")
	})


	user.following.splice(user.following.indexOf(tounfollow), 1);
	user.save(function(err){
		if (err) {Responsify.error(res,new restify.InternalError("Error updating unfollowing user")); return false;}
		console.log("tofollow removed from following ok")
	})
	
	Responsify.respond(res,200)

}

function find(req,res,user){
	//called by the authenticator function
	query = req.params.query
	school = req.params.school
	offset = req.params.offset

	if (!offset){
		offset = 0
	}

	if (!query){
		find = User.find({})
	} else{
		reg = new RegExp(query, "i")
		find = User.find({$or:[ {'username':reg}, {'full_name':reg}]})
	}

	if (school){
		find.find({school:school})
	}

	find
	.skip(offset)
	.limit(20)
	.lean()
	.exec(function(err,users){
		findRespond(req,res,err,users)
	})
}

function findRespond(req,res,err,users){
	if (err) {Responsify.error(res,new restify.InternalError("Error finding users.")); return false;}

	Responsify.respond(res,200,users)

}

module.exports.getUser = getUser;
module.exports.getSelf = getSelf;
module.exports.follow = follow;
module.exports.unfollow = unfollow;
module.exports.find = find;