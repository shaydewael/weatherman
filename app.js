/* Weatherman */

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// Get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// Provides http requests
var request = require('request');

// Provides access to SQL database
var ibmdb = require('ibm_db');

// Parses request body
var bodyParser = require('body-parser');

// Create a new express server
var app = express();
app.use(bodyParser.json());

// Serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// Database connection settings
var db = {
  db: "SQLDB",
  hostname: "75.126.155.153",
  port: 50000,
  username: "user17167",
  password: "bvRyojZUy1qT"
};

var connString = "DRIVER={DB2};DATABASE=" + db.db +
								 ";UID=" + db.username +
								 ";PWD=" + db.password +
								 ";HOSTNAME=" + db.hostname +
								 ";port=" + db.port + 
								 ";PROTOCOL=TCPIP";

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

	request.get(callUrl, { json: true }, function(err, response, body) {
		if (err) {
			res.json({ success: false });
		}
		else {
			res.json({ icon_code: body.observation.icon_code });
		}
	});
});

app.get('/highscores', function(req, res) {
	ibmdb.open(connString, function(err, conn) {
		if (err) {
			console.log(err);
		}
		else {
			var queryString = "SELECT Username, Score FROM Highscores";

			conn.query(queryString, function(err, rows, moreResultSets) {
				if (err)
					console.log(err);

				conn.close(function() {
					console.log(rows);
					res.send("Worked");
				});
			});
		}
	});
});

app.post('/highscores', function(req, res) {
	ibmdb.open(connString, function(err, conn) {
		if (err) {
			res.json({ success: false });
		}
		else {
			var queryStringInsert = "INSERT INTO HIGHSCORES (Username, Score) VALUES ('" +
												req.body.username + "', '" + req.body.score + "')";

			conn.query(queryStringInsert, function(err, rows, moreResultSets) {
				if (err) {
					res.json({ success: false });
				}
				else {
					//var queryString = "SELECT Username, Score FROM Highscores ORDER BY Score DESC LIMIT 5";
					var queryStringSelect = "SELECT Username, Score FROM Highscores ORDER BY Score DESC FETCH FIRST 5 ROWS ONLY";

					conn.query(queryStringSelect, function(err, rows, moreResultSets) {
						if (err) {
							res.json({ success: false });
						}
						else {
							conn.close(function() {
								console.log(rows);
								res.json({ data: rows, success: true });
							});
						}
					});
				}
			});
		}
	});
});

// Start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  console.log("server starting on " + appEnv.url);
});
