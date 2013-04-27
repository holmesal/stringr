function makeAuthToken()
{
    var token = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 20; i++ )
        token += possible.charAt(Math.floor(Math.random() * possible.length));

    return token;
}

function make(Schema, mongoose) {
    //user schema
	var userSchema = new Schema({
	    // username: String,
	    full_name: String,
	    profile_img: {type:String, default: "http://lorempixel.com/output/technics-q-c-640-480-8.jpg"},
	    school: {type: Schema.ObjectId,ref:'School'},
	    // strings_count: {type: Number, default: 0},
	    strings: [{type:Schema.Types.ObjectId,ref:'PhotoString'}],
	    blurb: String,
	    following: [{type: Schema.Types.ObjectId,ref:'User'}],
	    followers: [{type: Schema.Types.ObjectId,ref:'User'}],
	    likes: [{type: Schema.Types.ObjectId,ref:'Photo'}],
	    verified: {type: Boolean, default: false},
	    email: String,
	    // pw: String,
	    auth_token: String,
	    created : { type : Date, default: Date.now }

	})

	userSchema.methods.makeAuthToken = makeAuthToken

    return mongoose.model('User',userSchema)
}

module.exports.make = make;