
var restify = require('restify');
var mongoose = require('mongoose');
var bunyan = require('bunyan');

//Local setup
port = process.env.PORT || 5000
// port = process.env.PORT
console.log("THE PORT IS:"+port);

//useful db stuff
var db = mongoose.connection;
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId

//connect to mongodb
mongopath = process.env.MONGOHQ_URL || 'mongodb://localhost/stringr'
mongoose.connect(mongopath);
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log('connected to db')
});

//db schemas
var Schema = mongoose.Schema;
var User = require('./models/user.js').make(Schema, mongoose);
var School = require('./models/school.js').make(Schema, mongoose);
var PhotoString = require('./models/photostring.js').make(Schema,mongoose);
var Photo = require('./models/photo.js').make(Schema,mongoose);
var Comment = require('./models/comment.js').make(Schema,mongoose);

//utility modules
var Authenticatify = require('./utils/authenticatify.js')

//endpoint modules
var SignupEndpoint = require('./endpoints/signup.js')
var VerifyEndpoint = require('./endpoints/verify.js')
var UserEndpoint = require('./endpoints/user.js')
var SchoolEndpoint = require('./endpoints/school.js')
var StringEndpoint = require('./endpoints/string.js')
var PhotoEndpoint = require('./endpoints/photo.js')



function signupHandler(req,res) {
  //check availability and sign up
  SignupEndpoint.signup(req,res)
}

function verifyResendHandler(req,res) {
  Authenticatify.Authenticate(req,res,VerifyEndpoint.resend,true)
}

function verifyConfirmHandler(req,res) {
  VerifyEndpoint.confirm(req,res)
}

function userGetHandler(req,res){
  //grab the user
  UserEndpoint.getUser(req,res)
}

function userFindHandler(req,res){
  //find users
  Authenticatify.Authenticate(req,res,UserEndpoint.find,true)
}

function userSelfHandler(req,res){
  //grab self, going through the authenticator function
  //heavy=true means to grab all the user params and populate stuff
  Authenticatify.Authenticate(req,res,UserEndpoint.getSelf,true)
}

function userFollowHandler(req,res){
  //false means don't send back privaledged parameters
  Authenticatify.Authenticate(req,res,UserEndpoint.follow,false,false)
}

function userUnfollowHandler(req,res){
  //false means don't send back privaledged parameters
  Authenticatify.Authenticate(req,res,UserEndpoint.unfollow,false,false)
}

function makeSchoolHandler(req,res){
  //make a new school
  SchoolEndpoint.newSchool(req,res)
}

function findSchoolHandler(req,res){
  //make a new school
  SchoolEndpoint.findSchool(req,res)
}

function allSchoolsHandler(req,res){
  //find all the schools
  SchoolEndpoint.allSchools(req,res)
}

function newStringHandler(req,res){
  //grab user, going through the authenticator function
  Authenticatify.Authenticate(req,res,StringEndpoint.newString)
}

function findStringHandler(req,res){
  //grab user, going through the authenticator function
  Authenticatify.Authenticate(req,res,StringEndpoint.find,true)
}

function getStringHandler(req,res){
  //grab string
  StringEndpoint.getString(req,res)
}

function photoLikeHandler(req,res){
  Authenticatify.Authenticate(req,res,PhotoEndpoint.like,false,false)
}

function photoUnlikeHandler(req,res){
  Authenticatify.Authenticate(req,res,PhotoEndpoint.unlike,false,false)
}

function photoCommentHandler(req,res){
  Authenticatify.Authenticate(req,res,PhotoEndpoint.comment,false,false)
}


// function authTestHandler(req,res){
//   //grab user, going through the authenticator function
//   Authenticatify.Authenticate(req,res,UserEndpoint.getSelf)
// }


var server = restify.createServer();
server.use(restify.bodyParser());  //for post requests
server.use(restify.queryParser()); //for query strings

//signup handlers
server.post('/signup',signupHandler)

//verify handlers
server.get('/verify/resend',verifyResendHandler)
server.get('/verify/confirm/:user_id',verifyConfirmHandler)

//user handlers
server.get('/user/self',userSelfHandler)
server.get('/user/find',userFindHandler)
server.get('/user/:username',userGetHandler)
server.post('/user/:tofollow/follow',userFollowHandler)
server.post('/user/:tounfollow/unfollow',userUnfollowHandler)

//search handlers
// server.get('/search',searchHandler)

//school handlers
server.post('/school',makeSchoolHandler)
server.get('/school/all',allSchoolsHandler)
server.get('/school/:domain',findSchoolHandler)

//string handlers
server.post('/string/new',newStringHandler)
server.get('/string/find',findStringHandler)
server.get('/string/:string',getStringHandler)

//photo handlers
server.post('/photo/:photo_id/like',photoLikeHandler)
server.post('/photo/:photo_id/unlike',photoUnlikeHandler)
server.post('/photo/:photo_id/comment',photoCommentHandler)

//auth test handler
// server.post('/auth',authTestHandler)

server.listen(port, function() {
  console.log('%s listening at %s', server.name, server.url);
});