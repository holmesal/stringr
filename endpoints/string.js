var mongoose = require('mongoose');
var PhotoString = mongoose.model('PhotoString');
var Photo = mongoose.model('Photo');
var restify = require('restify');
var Responsify = require('../utils/responsify.js')


function newString(req,res,user){
	//called by the authenticator function
	photos = req.params.photos
	tags = req.params.tags
	title = req.params.title
	description = req.params.description

	if (!photos){Responsify.error(res,new restify.MissingParameterError("Missing or empty parameter: photos")); return false;}
	if (!tags){Responsify.error(res,new restify.MissingParameterError("Missing or empty parameter: tags")); return false;}
	if (!title){Responsify.error(res,new restify.MissingParameterError("Missing or empty parameter: title")); return false;}

	//create empty photo object
	var photostring = new PhotoString({
		title: title,
		description: description,
		tags: tags
	})

	for (var i = 0; i < photos.length; i++) {
		var photo = new Photo({
			url: photos[i]
		});
		photostring.photos.push(photo)
		photo.save(function(err){
			if (err) {Responsify.error(res,new restify.InternalError("Error saving photo")); return false;}
			console.log("photo saved")
		})
	};

	user.strings.push(photostring);
	user.save(function(err){
		if (err) {Responsify.error(res,new restify.InternalError("Error saving user after adding photostring")); return false;}
		console.log("user saved")
	})

	photostring.save(function(err){
		if (err) {Responsify.error(res,new restify.InternalError("Error saving photostring")); return false;}
		Responsify.respond(res,200,photostring)
		console.log("photostring saved")
	})
}

function getString(req,res,user){
	string_id = req.params.string
	if (!string_id){Responsify.error(res,new restify.MissingParameterError("Must include string id in url")); return false;}

	PhotoString
	.findOne({_id:string_id})
	.populate('photos')
	.exec(function(err,string){
		getStringRespond(req,res,err,string)
	})
}

function getStringRespond(req,res,err,string){
	if (err) {Responsify.error(res,new restify.InternalError("DB error finding string.")); return false;}

	if (!string){
		Responsify.error(res,new restify.InternalError("No string with that id found"));
	} else{
		Responsify.respond(res,200,string)
	}
}


module.exports.newString = newString;
module.exports.getString = getString;