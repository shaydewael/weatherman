/* Weatherman */

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// Provides http requests
var request = require('request');

// Create a new express server
var app = express();

// Serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

app.get('/weather', function(req, res) {
	var options = {
    language: "en-US",
    units: "e"
  };

	var url = 'https://9bec92cf-9cef-402d-ad65-5c87126bbfba:zsTVZpL1HO@twcservice.mybluemix.net';
	var endPoint = '/api/weather/v2/observations/current';
	var geocode =  "?geocode=" + encodeURIComponent(req.query.latitude + "," + req.query.longitude);
	var language = "&language=" + encodeURIComponent(options.language);
	var units =  "&units=" + encodeURIComponent(options.units);
	var callUrl = url + endPoint + geocode + language + units;

	request.get(callUrl, {
		json: true
		},
		function(err, response, body) {
			if (err) {
				res.json({ success: false });
			}
			else {
				res.json({ icon_code: body.observation.icon_code });
			}
		}
	);
});

// Get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// Start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  console.log("server starting on " + appEnv.url);
});
