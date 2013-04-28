var mongoose = require('mongoose');
var PhotoString = mongoose.model('PhotoString');
var Photo = mongoose.model('Photo');
var restify = require('restify');
var Responsify = require('../utils/responsify.js')
var async = require('async');


function newString(req,res,user){
	//called by the authenticator function
	photos = req.params.photos
	tags = req.params.tags
	title = req.params.title
	// description = req.params.description

	if (!photos){Responsify.error(res,new restify.MissingParameterError("Missing or empty parameter: photos")); return false;}
	if (!tags){Responsify.error(res,new restify.MissingParameterError("Missing or empty parameter: tags")); return false;}
	if (!title){Responsify.error(res,new restify.MissingParameterError("Missing or empty parameter: title")); return false;}

	//create empty photo object
	var photostring = new PhotoString({
		title: title,
		// description: description,
		tags: tags,
		school: user.school,
		owner: user
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

function findString(req,res,user){
	//called by the authenticator function
	query = req.params.query
	school = req.params.school
	offset = req.params.offset

	if (!offset){
		offset = 0
	}

	// if (!query){
	// 	find = PhotoString.find({})
	// } else{
	// 	// reg = new RegExp(query, "i")
	// 	// find = PhotoString.find({$or:[ {'username':reg}, {'full_name':reg}]})
	// 	// find = 
	// }
	
	reg = new RegExp(query, "i")

	find = PhotoString.find({tags: { $in: [reg]}})

	if (school){
		find.find({school:school})
	}

	find
	.skip(offset)
	.limit(20)
	.populate("photos owner")
	// .lean()
	.exec(function(err,users){
		findRespond(req,res,err,users)
	})
}

function populatePhotos(item,callback){
	item.populate("photos")
	callback()
}

function findRespond(req,res,err,strings){
	if (err) {Responsify.error(res,new restify.InternalError("Error finding strings.")); return false;}

	async.each(strings,populatePhotos,function(){
		Responsify.respond(res,200,strings)
	})

}

function editString(req,res,user){
	string_id = req.params.string
	if (!string_id){Responsify.error(res,new restify.MissingParameterError("Must include string id in url")); return false;}

	PhotoString
	.findOne({_id:string_id})
	.populate('photos')
	.populate('owner')
	.exec(function(err,string){
		editStringCallback(req,res,err,string,user)
	})
}

function editStringCallback(req,res,err,string,user){
	if (err) {Responsify.error(res,new restify.InternalError("DB error finding string.")); return false;}

	if (!string){
		Responsify.error(res,new restify.InternalError("No string with that id found"));
	} else{
		if (string.is_public || string.owner._id.equals(user._id)){ //public or owner works
			applyChanges(req,res,err,string,user)
		} else{
			Responsify.error(res,new restify.NotAuthorizedError("That string is not public."));
		}
	}
}

function applyChanges(req,res,err,string,user){
	//all the things only the owner is allowed to do
	//string.owner is an id
	//user._id is an id
	// console.log(string.owner._id)
	// console.log(user._id)
	if (string.owner._id.equals(user._id)){  //user is the owner of the string
		//there is no way to make a public string private
		if (req.params.title){
			string.title = req.params.title;
		}

		if (req.params.description){
			string.description = req.params.description;
		}

		if (req.params.tags){	//owner can edit tags, not just add
			string.tags = req.params.tags;
		}

		if (req.params.is_public && req.params.is_public == true){
			//is_public is both there and true
			string.is_public = true;
		}
	}

	//add any new tags (dupes should be removed on the iPhone)
	if (req.params.tags){
		string.tags = string.tags.concat(req.params.tags);	//contributors can only add
	}

	//do photo stuff
	if (req.params.photos){
		
	}
	console.log(string.title)
	// console.log(string.photos)
	Responsify.respond(res,200,string)
}


module.exports.newString = newString;
module.exports.getString = getString;
module.exports.findString = findString;
module.exports.editString = editString;