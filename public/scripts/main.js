var setLocation;

(function() {
  "use strict";

  var settings;
  var highscores;
  var img;
  var rand;

  var gLatitude;
  var gLongitude;
  var locationSet = 0;
  var checkLocation;
  
  setLocation = function(lat,long) {
    gLatitude = lat.toString();;
    gLongitude = long.toString();;
    locationSet = 1;
  }
  var coin = {
    radius: 20,
    y: 400,
    x: 850,
    velocity: 5,
    mult: 1.0,
    url: null,
    
    drawCoin: function(e) {
      img = new Image();
      img.src = coin.url;
      WeatherMan.ctx.drawImage(img,coin.x,coin.y);
    }
  }
  var obstacle = {
    height: 25,
    width: 25,
    y: 475,
    x: 850,
    minVelocity: 10,
    maxVelocity: 20,
    velocity: 10,
    lengthMin: 20,
    lengthMax: 40,
    acceleration: .05,
    color: '#000066',

    drawObstacle: function(e) {
      WeatherMan.ctx.beginPath();
      WeatherMan.ctx.rect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      WeatherMan.ctx.fillStyle = obstacle.color;
      WeatherMan.ctx.fill();
      WeatherMan.ctx.closePath();
    }
  }
  var man = {
    height: 176,
    width: 59,
    x: 100,
    y: 324,
    inAir: 0,
    gravity: 4,
    velocity: 0,
    currentVelocity: 35,

    drawMan: function(e) {
      WeatherMan.ctx.globalAlpha = 0.9;
      
      img = new Image();
      img.src = "images/light-man.png";
      WeatherMan.ctx.drawImage(img,man.x,man.y);

      WeatherMan.ctx.globalAlpha = 1.0;
      
    },
    jump: function() {
      if (man.inAir == 0) {
        man.velocity = man.currentVelocity;
        man.inAir = 1;
      }
    }
  }

  //This is the game object
  var WeatherMan = {
    // Game canvas
    canvas: 0,
    ctx: 0,
    interval: null,
    // Boundaries
    leftWall: 0,
    rightWall: 0,
    topWall: 0,
    bottomWall: 0,
    score: 0,
    playing:0,
    message: null,
    // Settings
    settings: {
      // For canvas
      width: "850px",
      height: "500px",
      // Weather location
      latitude: null,
      longitude: null,
      weather: null
    },
    init: function() {

      WeatherMan.canvas = document.querySelector('canvas');
      WeatherMan.ctx = WeatherMan.canvas.getContext("2d");
      WeatherMan.ctx.fillStyle="#EEEEEE";
      WeatherMan.ctx.fillRect(0,0,850,500);


      WeatherMan.ctx.font = "35px 'Lato'";
      WeatherMan.ctx.fillStyle = "#939393";

      WeatherMan.ctx.fillText("Determining weather...", 250, 250);
    },
    setGradient: function() {
      WeatherMan.ctx.clearRect(0, 0, WeatherMan.canvas.width, WeatherMan.canvas.height);
      var grd=WeatherMan.ctx.createLinearGradient(0,0,0,170);

      if (WeatherMan.settings.weather == 'rain') {
        coin.url = "images/rain.png"
        grd.addColorStop(0,"#856279");
        grd.addColorStop(1,"#ba8295");
        obstacle.color = '#856279';
      } else if (WeatherMan.settings.weather == 'sunny') {
        coin.url = "images/sun.png"
        grd.addColorStop(0,"#61c5d8");
        grd.addColorStop(1,"#97eeff");
        obstacle.color = '#55b8cb';
      } else if (WeatherMan.settings.weather == 'snow') {
        coin.url = "images/snowflake.png"
        grd.addColorStop(0,"#88b3be");
        grd.addColorStop(1,"#b1d7de");
        obstacle.color = '#88b3be';
      } else {
        coin.url = "images/cloud.png"
        grd.addColorStop(0,"#210b38");
        grd.addColorStop(1,"#423970");
        obstacle.color = '#210b38';
      } 

      WeatherMan.ctx.fillStyle=grd;
      WeatherMan.ctx.fillRect(0,0,850,500);
      WeatherMan.ctx.globalAlpha = 0.7;
      WeatherMan.ctx.fillStyle = "#f5f1f1";
      WeatherMan.ctx.fillRect(0,492,850,8);
      WeatherMan.ctx.globalAlpha = 1.0;

      man.drawMan();

    },
    initListeners: function() {
      WeatherMan.ctx.fillStyle="#EEEEEE";
      WeatherMan.ctx.fillRect(0,0,850,500);
      WeatherMan.ctx.globalAlpha = 0.9;
      WeatherMan.ctx.font = "35px 'Lato'";
      WeatherMan.ctx.fillStyle = "#939393";
      WeatherMan.ctx.fillText("Welcome to WeatherMan!", 100, 100);
      WeatherMan.ctx.fillText("Please enable location on your browser", 100, 150);
      WeatherMan.ctx.fillText("Each obstacle you jump over is 1 point", 100, 200);
      WeatherMan.ctx.fillText("Each token you collect is 3 points", 100, 250);
      WeatherMan.ctx.font = "45px 'Lato'";
      WeatherMan.ctx.fillText("Press Enter to Begin", 100, 400);
      WeatherMan.ctx.globalAlpha = 1.0;

      window.addEventListener('keypress', function(e) {
        var key = e.keyCode;

        switch (key) {
          case 32:
          e.preventDefault();
          man.jump();
          break;
          case 13: 
          if (WeatherMan.playing == 0) {
            $("#locations").hide();
            $("h1").css("float", "");
            $("h1").css("text-align", "center");
            var gameLoop = WeatherMan.startLoop();
            WeatherMan.playing = 1;
          }
          break;
        }
      }, false);
    },
    randomInterval: function(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min; 
    },
    getLocation: function() {
      var self = this;
      var options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      };

      function success(pos) {
        self.settings.latitude = pos.coords.latitude.toFixed(2);
        self.settings.longitude = pos.coords.longitude.toFixed(2);
        self.getWeather();
        self.initListeners();
      }

      function error(err) {
        // Default West Lafayette
        self.settings.latitude = 40.43;
        self.settings.longitude = -86.91;
        self.getWeather();
        self.initListeners();
      }

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error, options);
      }
      else {
        // Default West Lafayette
        self.settings.latitude = 40.43;
        self.settings.longitude = -86.91;
        self.getWeather();
        self.initListeners();
      }
    },
    changeLocation: function(long,lat) {
      clearInterval(checkLocation);
      locationSet = 0;
      WeatherMan.settings.latitude = lat;
      WeatherMan.settings.longitude = long;
      $("#locations").hide();
      $("h1").css("float", "");
      $("h1").css("text-align", "center");
      WeatherMan.ctx.clearRect(0, 0, WeatherMan.canvas.width, WeatherMan.canvas.height);
      WeatherMan.init();
      WeatherMan.getWeather();
      WeatherMan.initListeners();
    },
    getWeather: function() {
      var self = this;
      var options = {
        language: "en-US",
        units: "e"
      };

      var location = {
        latitude: this.settings.latitude,
        longitude: this.settings.longitude
      }

      console.log(location);

      $.get({
        url: document.URL + 'weather',
        contentType: "application/json; charset=utf-8",
        data: location,
        success: function(result) {
          /*
            Code 1,2,3,23,35,36,37,39,41,43,44,45,46 - N/A
            Code 4,38,47 - Thunderstorms
            Code 5,6,7,8,10,17,18 - Sleet
            Code 9,11,12,40 - Rain
            Code 13,14,15,16,25,42 - Snow
            Code 19,24 - Wind
            Code 20,21,22 - Fog
            Code 26,27,28,29,30 - Cloudy
            Code 31,33 - Clear (Night)
            Code 32,34 - Sunny
            */
            var code = result.icon_code;

            if (code == 4 || code == 38 || code == 47) {
              self.settings.weather = 'rain';
            }
            else if ((code >= 5 && code <= 10) || code == 17 || code == 18) {
              self.settings.weather = 'cloudy';
            }
            else if (code == 9 || code == 11 || code == 12 || code == 40) {
              self.settings.weather = 'rain';
            }
            else if ((code >= 13 && code <= 16) || code == 25 || code == 42) {
              self.settings.weather = 'snow';
            }
            else if (code == 20 || code == 21 || code == 22) {
              self.settings.weather = 'cloudy';
            }
            else if (code >= 26 && code <= 30) {
              self.settings.weather = 'cloudy';
            }
            else if (code == 32 || code == 34) {
              self.settings.weather = 'sunny';
            }
            else {
            // Default sunny
            self.settings.weather = 'sunny';
          }

          settings = self.settings;
          
        }
      });
    },
    startLoop: function() {

      this.interval = setInterval(function() {
        WeatherMan.loop();
      }, 1000 / 25);
    },
    loop: function() {
      //Start game loop, draw objects and stuff
      if (man.inAir == 1) {
        man.velocity = man.velocity - man.gravity;
        if (man.y - man.velocity < 324 ) {
          man.y = man.y - man.velocity;
        }
        else {
          man.y = 324;
          man.inAir = 0;
          man.velocity = 0;
        }
      }

      WeatherMan.setGradient();

      
      WeatherMan.ctx.globalAlpha = 0.85;
      //Score text
      WeatherMan.ctx.beginPath();
      WeatherMan.ctx.fillStyle = "#f9f9f9";
      WeatherMan.ctx.font = " 20px 'Lato'";
      WeatherMan.ctx.fillText("Score: " + WeatherMan.score, 750, 50);
      WeatherMan.ctx.closePath();

      //Message text
      if (WeatherMan.message) {
        WeatherMan.ctx.beginPath();
        WeatherMan.ctx.fillText(WeatherMan.message, 50, 50);
        WeatherMan.ctx.closePath();
        WeatherMan.message = null;
      }

      WeatherMan.ctx.globalAlpha = 1.0;

      obstacle.velocity = obstacle.velocity + obstacle.acceleration;
      obstacle.x = obstacle.x - obstacle.velocity;
      if (obstacle.x < 0 ) {
        obstacle.x = 850;
        obstacle.velocity = WeatherMan.randomInterval(obstacle.minVelocity, obstacle.maxVelocity);
        obstacle.height = WeatherMan.randomInterval(obstacle.lengthMin, obstacle.lengthMax);
        obstacle.width = WeatherMan.randomInterval(obstacle.lengthMin, obstacle.lengthMax);
        obstacle.y = 500 - obstacle.height;
        WeatherMan.score++;
      }
      if (obstacle.velocity > 60) {
        obstacle.acceleration = 0; 
      }
      if ( obstacle.velocity < 60 && obstacle.acceleration < 1) {
        obstacle.acceleration = .1;
      }

      obstacle.drawObstacle();
      coin.x = coin.x - coin.velocity;
      
      if ((coin.x <= (man.x + man.width)) && (coin.x >= man.x) && ((coin.y + (coin.radius*2)) >= man.y) && ((coin.y + (coin.radius*2)) <= (man.y + man.height))) {
        coin.x = 850;
        WeatherMan.score += 3;
        coin.velocity = WeatherMan.randomInterval(5,10);
        rand = Math.random();
        if (rand < 0.3) {
          coin.mult = 0.4;
        } else if (rand < 0.6) {
          coin.mult = 0.7;
        } else {
          coin.mult = 1.0;
        }
        coin.y = 400 * coin.mult;
      } else if (coin.x < man.x) {
        coin.x = 850;
        coin.velocity = WeatherMan.randomInterval(5,10);
        if (rand < 0.3) {
          coin.mult = 0.4;
        } else if (rand < 0.6) {
          coin.mult = 0.7;
        } else {
          coin.mult = 1.0;
        }
        coin.y = 400 * coin.mult;
      }


      coin.drawCoin();

      if (obstacle.x < (man.x + man.width) && obstacle.x > man.x) {
        if ((man.y + man.height) >= obstacle.y) {
          WeatherMan.stopLoop(); 
        }
      }

      if (WeatherMan.score > 20 && WeatherMan.score <= 27) {
        obstacle.minVelocity = 20;
        obstacle.maxVelocity = 30;
        if (!WeatherMan.message) {
          WeatherMan.message = "Score passed 20. Speeding up!";
        }
      }
      else if (WeatherMan.score > 50 && WeatherMan.score <= 57) {
        obstacle.lengthMin = 30;
        obstacle.lengthMax = 60;
        man.currentVelocity = 40;
        if (!WeatherMan.message) {
          WeatherMan.message = "Score passed 50. Obstacles are getting larger!";
        }
      }
      else if (WeatherMan.score > 75 && WeatherMan.score <= 82) {
        obstacle.minVelocity = 30;
        obstacle.maxVelocity = 40;
        if (!WeatherMan.message) {
          WeatherMan.message = "Score passed 75. Speeding up even faster!";
        }
      }
      else if (WeatherMan.score > 100 && WeatherMan.score <= 107) {
        obstacle.lengthMin = 55;
        obstacle.lengthMax = 80;
        man.currentVelocity = 45;
        if (!WeatherMan.message) {
          WeatherMan.message = "Score passed 100. Obstacles are getting larger!";
        }
      }
      else if (WeatherMan.score > 125 && WeatherMan.score <= 135) {
        obstacle.minVelocity = 40;
        obstacle.maxVelocity = 46;
        obstacle.lengthMin = 75;
        obstacle.lengthMax = 113;
        if (!WeatherMan.message) {
          WeatherMan.message = "Score passed 125. Get ready for hardcore mode!";
        }
      }
    },
    stopLoop: function() {
      clearInterval(this.interval);

      // TODO: Get username

      var user = {};
      user.username = document.getElementById('Username').value; 
      console.log('USERNAME ' + user.username); 
      user.score = WeatherMan.score;
      try {
        $.ajax({
          type: 'POST',
          url: document.URL + 'highscores',
          data: JSON.stringify(user),
          contentType: 'application/json',
          success: function(result) {
            highscores = result;
            console.log('Posted Score to database.');
            console.log(result);
          // TODO: Display results nicely
            WeatherMan.ctx.fillText("High Scores", 75, 100);
            WeatherMan.ctx.beginPath();
            WeatherMan.ctx.moveTo(25,110);
            WeatherMan.ctx.lineTo(300, 110);
            WeatherMan.ctx.stroke();
            WeatherMan.ctx.closePath();
            for (var i = 0; i < 5; i++) {
                WeatherMan.ctx.fillText(result.data[i].USERNAME + ": " +result.data[i].SCORE, 75, 160 + 60*i);
            }
        }
      });
      } catch (e) {

      }

      WeatherMan.ctx.clearRect(0, 0, WeatherMan.canvas.width, WeatherMan.canvas.height);
      WeatherMan.ctx.font = "35px 'Lato'";
      WeatherMan.ctx.fillStyle = "#939393";
      WeatherMan.ctx.fillText("Game Over", 600, 100);
      WeatherMan.ctx.fillText("Score: " + WeatherMan.score, 650, 160);
      WeatherMan.ctx.fillText("Press Enter to play again", 400, 220);
      $("#locations").show();
      $("h1").css("float", "left");
      $("h1").css("text-align", "left");
      WeatherMan.playing = 0;
      WeatherMan.score = 0;
      man.currentVelocity = 35;
      coin.x = 850;
      coin.y = 400;
      coin.velocity = 5;
      obstacle.height = 25;
      obstacle.width = 25;
      obstacle.y = 475;
      obstacle.x = 850;
      obstacle.lengthMin = 20;
      obstacle.lengthMax = 40;
      obstacle.velocity = 10;
      obstacle.minVelocity = 10;
      obstacle.maxVelocity = 20;
      obstacle.acceleration = .05;


      checkLocation = setInterval(function(){ if (locationSet == 1) {
        try {
          WeatherMan.changeLocation(gLongitude,gLatitude);
        } catch(e) {

        }
      }}, 200);
    }
  };
  window.onload = function() {
    // This is the main method
    WeatherMan.getLocation();
    $("#locations").hide();
    //Allow weather data to be retrieved first 
    WeatherMan.init();
    
    
  };
})();
