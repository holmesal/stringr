var mongoose = require('mongoose');
var Photo = mongoose.model('Photo');
var Comment = mongoose.model('Comment');
var restify = require('restify');
var Responsify = require('../utils/responsify.js')

function failOrLike(req,res,err,photo,user){
	if (err) {Responsify.error(res,new restify.InternalError("DB error finding photo.")); return false;}

	if (!photo){
		Responsify.error(res,new restify.InternalError("No photo with that id found"));
	} else if (photo.likes.indexOf(user._id) != -1){
		Responsify.respond(res,200)
	} else{
		//add user to likes
		photo.likes.push(user)
		photo.save(function(err){
			if (err) {Responsify.error(res,new restify.InternalError("Error saving photo after adding user")); return false;}
			console.log("photo saved")
		})
		console.log(user)
		user.likes.push(photo)
		user.save(function(err){
			if (err) {Responsify.error(res,new restify.InternalError("Error saving user after adding photo")); return false;}
			console.log("user saved")
			Responsify.respond(res,200)
		})
	}
}

function like(req,res,user){
	//called by the authenticator function
	photo_id = req.params.photo_id

	if (!photo_id){Responsify.error(res,new restify.MissingParameterError("You must pass the photo to like: /photo/{id}/like")); return false;}

	Photo
	.findOne({_id:photo_id})
	.exec(function(err,photo){
		failOrLike(req,res,err,photo,user)
	})

}

function unlike(req,res,user){
	//called by the authenticator function
	photo_id = req.params.photo_id

	if (!photo_id){Responsify.error(res,new restify.MissingParameterError("You must pass the photo to unlike: /photo/{id}/unlike")); return false;}

	Photo
	.findOne({_id:photo_id})
	.exec(function(err,photo){
		failOrUnlike(req,res,err,photo,user)
	})
}

function failOrUnlike(req,res,err,photo,user){
	if (err) {Responsify.error(res,new restify.InternalError("DB error finding photo.")); return false;}

	if (!photo){
		Responsify.error(res,new restify.InternalError("No photo with that id found"));
	} else{

		photo.likes.splice(photo.likes.indexOf(user._id), 1);
		photo.save(function(err){
			if (err) {Responsify.error(res,new restify.InternalError("Error updating photo to unlike")); return false;}
			console.log("user removed from photo likes ok")
		})


		user.likes.splice(user.likes.indexOf(photo), 1);
		user.save(function(err){
			if (err) {Responsify.error(res,new restify.InternalError("Error updating unliking user")); return false;}
			console.log("photo removed from likes ok")
		})
		
		Responsify.respond(res,200)
	}
}

function comment(req,res,user){
	//called by the authenticator function
	photo_id = req.params.photo_id
	comment_text = req.params.comment_text
	if (!photo_id){Responsify.error(res,new restify.MissingParameterError("You must pass the photo to comment on: /photo/{id}/comment")); return false;}
	if (!comment_text){Responsify.error(res,new restify.MissingParameterError("You must pass your comment text as a parameter")); return false;}

	Photo
	.findOne({_id:photo_id})
	.exec(function(err,photo){
		failOrComment(req,res,err,photo,user)
	})
}

function failOrComment(req,res,err,photo,user){
	if (err) {Responsify.error(res,new restify.InternalError("DB error finding photo.")); return false;}

	if (!photo){
		Responsify.error(res,new restify.InternalError("No photo with that id found"));
	} else{
		comment = new Comment({
			user: user,
			comment_text: req.params.comment_text
		})
		comment.save(function(err){
			if (err) {Responsify.error(res,new restify.InternalError("Error saving comment")); return false;}
			console.log("comment saved okay")
		})

		photo.comments.push(comment)
		photo.save(function(err){
			if (err) {Responsify.error(res,new restify.InternalError("Error saving comment")); return false;}
			console.log("photo saved okay")
			Responsify.respond(res,200)
		})
	}
}


module.exports.like = like;
module.exports.unlike = unlike;
module.exports.comment = comment;