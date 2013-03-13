function make(Schema, mongoose) {
    //user schema
	var photoSchema = new Schema({
		url: String,
		likes: [{type: Schema.ObjectId,ref:"User"}],
		comments: [{type: Schema.ObjectId,ref:"Comment"}]

	})

    // mongoose.model('Car', CarSchema);
    return mongoose.model('Photo',photoSchema)
}

module.exports.make = make;