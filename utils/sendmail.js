var restify = require('restify')
var assert = require('assert')

//sends confirmation emails through mandrill
//uses authentication code (for api) currently
//would be more secure if a new random code is generated

function sendmail(user){
	console.log(user.email)
	console.log(user._id)
	console.log(user.auth_token)

	// Creates a JSON client
	var client = restify.createJsonClient({
	  url: 'https://mandrillapp.com',
	  accept: '*'
	});

	//parameters
	params = {
		key: "BIJHl9wY1Hw4Bm-yfHlxTQ",
		template_name: "test",
		template_content: [],
		message: {
			subject: "Welcome to Stringr!",
			from_email: "verificationrobot1369@stringrapp.com",
			from_name: "Stringr Verification Robot 1369",
			to: [
				{
					email: user.email,
					name: user.username
				}
			],
			track_opens: true,
			track_clicks: true,
			merge_vars: [
				{
					rcpt: user.email,
					vars: [
						{
							name: "username",
							content: user.username
						},
						{
							name: "user_id",
							content: user._id
						},
						{
							name: "verify_key",
							content: user.auth_token
						}
					]
				}
			]
		}
	}

	//post request
	client.post('/api/1.0/messages/send-template.json', params, function(err, req, res, obj) {
	  assert.ifError(err);
	  console.log('%d -> %j', res.statusCode, res.headers);
	  console.log(obj);
	});
}

module.exports.sendmail = sendmail;