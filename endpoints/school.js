var mongoose = require('mongoose');
var School = mongoose.model('School');
var restify = require('restify');
var Responsify = require('../utils/responsify.js')

function failOrMake(req,res,err,schools){
		if (err) {Responsify.error(res,new restify.InternalError("Error checking school existance.")); return false;}

		if (schools){
			Responsify.error(res,new restify.InternalError("School already exists."));
		} else{
			//grab params
			domain = req.params.domain
			name = req.params.name
			if (!domain){Responsify.error(res,new restify.MissingParameterError("Missing or empty parameter: domain")); return false;}
			if (!name){Responsify.error(res,new restify.MissingParameterError("Missing or empty parameter: name")); return false;}
			// if (!short_name){Responsify.error(res,new restify.MissingParameterError("Missing or empty parameter: short_name")); return false;}
			//create the school
			var school = new School({
				domain : domain,
				name: name
			});
			// save the school
			school.save(function(err,school){
				if (err){Responsify.error(res,new restify.InternalError("Error saving school"));return false;}

				Responsify.respond(res,200,school)
			})
			
		}

	}

function newSchool(req,res){

	// console.log(req.params)

	domain = req.params.domain

	School
	.findOne({domain:domain})
	.exec(function(err,school){
		failOrMake(req,res,err,school)
	})
}

function findSchoolRespond(req,res,err,school){
	if (err) {Responsify.error(res,new restify.InternalError("Error finding school.")); return false;}

	if (!school){
		Responsify.error(res,new restify.InternalError("Couldn't find that school."));
	} else{
		Responsify.respond(res,200,school)
	}
}

function findSchool(req,res){

	domain = req.params.domain.toLowerCase()

	School
	.findOne({domain:domain})
	.exec(function(err,school){
		findSchoolRespond(req,res,err,school)
	})

}

function allSchools(req,res){
	School
	.find({})
	.exec(function(err,school){
		allSchoolsRespond(req,res,err,school)
	})
}

function allSchoolsRespond(req,res,err,schools){
	if (err) {Responsify.error(res,new restify.InternalError("Error finding all schools.")); return false;}

	if (!schools){
		Responsify.error(res,new restify.InternalError("No schools found."));
	} else{
		Responsify.respond(res,200,schools)
	}
}


module.exports.newSchool = newSchool;
module.exports.findSchool = findSchool;
module.exports.allSchools = allSchools;