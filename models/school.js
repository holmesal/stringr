function make(Schema, mongoose) {
    //user schema
	var schoolSchema = new Schema({
	    domain: String,
	    long_name: String,
	    short_name: String,
	    created : { type : Date, default: Date.now }

	})

    // mongoose.model('Car', CarSchema);
    return mongoose.model('School',schoolSchema)
}

module.exports.make = make;