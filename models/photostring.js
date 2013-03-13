function make(Schema, mongoose) {
    //user schema
	var photoStringSchema = new Schema({
		title: String,
		description: String,
	    photos: [{type: Schema.ObjectId,ref:'Photo'}],
	    tags: [String],
	    created : { type : Date, default: Date.now }

	})

    // mongoose.model('Car', CarSchema);
    return mongoose.model('PhotoString',photoStringSchema)
}

module.exports.make = make;