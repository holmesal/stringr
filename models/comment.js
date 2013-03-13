function make(Schema, mongoose) {
    //user schema
	var commentSchema = new Schema({
		user: {type: Schema.ObjectId,ref:"User"},
		comment_text: String,
		created : { type : Date, default: Date.now }

	})

    // mongoose.model('Car', CarSchema);
    return mongoose.model('Comment',commentSchema)
}

module.exports.make = make;