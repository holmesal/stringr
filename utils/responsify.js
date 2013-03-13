var messages = {
	200: "ok"
}

function respond(res,meta_code,data) {
    
    //build meta response
    meta = {
    	code: meta_code,
    	message: messages[meta_code] 
    }

    //data is optional
    data = typeof data !== 'undefined' ? data : {};

    response = {
    	meta: meta,
    	data: data 
    }

    res.send(response)

	// userSchema.methods.makeAuthToken = makeAuthToken
    // mongoose.model('Car', CarSchema);
    // return mongoose.model('user',userSchema)
}

function error(res,restify_error){
	
	meta = {
		code: restify_error.statusCode,
		message: restify_error.message
	}

	response = {
		meta: meta,
		data: {}
	}

	res.send(response)

	// RestError
	// BadDigestError
	// BadMethodError
	// InternalError
	// InvalidArgumentError
	// InvalidContentError
	// InvalidCredentialsError
	// InvalidHeaderError
	// InvalidVersionError
	// MissingParameterError
	// NotAuthorizedError
	// RequestExpiredError
	// RequestThrottledError
	// ResourceNotFoundError
	// WrongAcceptError

}

module.exports.respond = respond;
module.exports.error = error;