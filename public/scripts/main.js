(function() {
  "use strict";

  var settings;
  var highscores;
  var img;
  var rand;
  
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
      WeatherMan.ctx.drawImage(img,coin.x,coin.y * coin.mult);
    }
  }
  var obstacle = {
    height: 25,
    width: 25,
    y: 475,
    x: 850,
    velocity: 10,
    acceleration: .05,

    drawObstacle: function(e) {
      WeatherMan.ctx.beginPath();
      WeatherMan.ctx.rect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      WeatherMan.ctx.fillStyle = "#000066";
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

    drawMan: function(e) {
      WeatherMan.ctx.globalAlpha = 0.9;
      
      img = new Image();
      img.src = "images/light-man.png";
      WeatherMan.ctx.drawImage(img,man.x,man.y);

      WeatherMan.ctx.globalAlpha = 1.0;
      
    },
    jump: function() {
      if (man.inAir == 0) {
        man.velocity = 40;
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
      } else if (WeatherMan.settings.weather == 'sunny') {
        coin.url = "images/sun.png"
        grd.addColorStop(0,"#55b8cb");
        grd.addColorStop(1,"#e3e4c5");
      } else if (WeatherMan.settings.weather == 'snow') {
        coin.url = "images/snowflake.png"
        grd.addColorStop(0,"#88b3be");
        grd.addColorStop(1,"#b1d7de");
      } else {
        coin.url = "images/snowflake.png"
        grd.addColorStop(0,"#210b38");
        grd.addColorStop(1,"#31295a");
      } 

      WeatherMan.ctx.fillStyle=grd;
      WeatherMan.ctx.fillRect(0,0,850,500);
      WeatherMan.ctx.fillStyle = "#f5f1f1";
      WeatherMan.ctx.fillRect(0,492,850,8);

      man.drawMan();

    },
    initListeners: function() {
      WeatherMan.setGradient();
      WeatherMan.ctx.globalAlpha = 0.9;
      WeatherMan.ctx.font = "35px 'Lato'";
      WeatherMan.ctx.fillStyle = "#f9f9f9";
      WeatherMan.ctx.fillText("Welcome to WeatherMan!", 100, 100);
      WeatherMan.ctx.fillText("Please enable location on your browser", 100, 150);
      WeatherMan.ctx.fillText("Each obstacle you jump over is 1 point", 100, 200);
      WeatherMan.ctx.fillText("Each token you collect is 5 points", 100, 250);
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
      }

      function error(err) {
        // Default West Lafayette
        self.settings.latitude = 40.43;
        self.settings.longitude = -86.91;
        self.getWeather();
      }

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error, options);
      }
      else {
        // Default West Lafayette
        self.settings.latitude = 40.43;
        self.settings.longitude = -86.91;
        self.getWeather();
      }
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
          WeatherMan.initListeners();
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

      console.log(WeatherMan.settings.weather);
      WeatherMan.setGradient();

      
      WeatherMan.ctx.globalAlpha = 0.9;
      WeatherMan.ctx.beginPath();

      WeatherMan.ctx.fillStyle = "#f9f9f9";
      WeatherMan.ctx.font = " 20px 'Lato'";
      WeatherMan.ctx.fillText("Score: " + WeatherMan.score, 750, 50);
      WeatherMan.ctx.closePath();
      WeatherMan.ctx.globalAlpha = 1.0;

      obstacle.velocity = obstacle.velocity + obstacle.acceleration;
      obstacle.x = obstacle.x - obstacle.velocity;
      if (obstacle.x < 0 ) {
        obstacle.x = 850;
        obstacle.velocity = WeatherMan.randomInterval(10, 45)
        obstacle.height = WeatherMan.randomInterval(25, 60);
        obstacle.width = WeatherMan.randomInterval(25, 60);
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
        WeatherMan.score += 5;
        coin.velocity = WeatherMan.randomInterval(2,10);
        rand = Math.random();
        if (rand < 0.3) {
          coin.mult = 0.4;
        } else if (rand < 0.6) {
          coin.mult = 0.7;
        } else {
          coin.mult = 1.0;
        }
      } else if (coin.x < man.x) {
        coin.x = 850;
        coin.velocity = WeatherMan.randomInterval(2,10);
        if (rand < 0.3) {
          coin.mult = 0.4;
        } else if (rand < 0.6) {
          coin.mult = 0.7;
        } else {
          coin.mult = 1.0;
        }
      }

      coin.drawCoin();

      if (obstacle.x < (man.x + man.width) && obstacle.x > man.x) {
        if ((man.y + man.height) >= obstacle.y) {
          WeatherMan.stopLoop(); 
        }
      }
    },
    stopLoop: function() {
      clearInterval(this.interval);

      // TODO: Get username

      var user = {};
      user.username = "Anna";
      user.score = WeatherMan.score;

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
        }
      });

      WeatherMan.ctx.clearRect(0, 0, WeatherMan.canvas.width, WeatherMan.canvas.height);
      WeatherMan.ctx.font = "35px 'Lato'";
      WeatherMan.ctx.fillStyle = "#939393";
      WeatherMan.ctx.fillText("Game Over", 345, 150);
      WeatherMan.ctx.fillText("Score: " + WeatherMan.score, 355, 250);
      WeatherMan.ctx.fillText("Press Enter to play again", 250, 350);
      WeatherMan.playing = 0;
      WeatherMan.score = 0;
      coin.x = 850;
      coin.y = 400;
      coin.velocity = 5;
      obstacle.height = 25;
      obstacle.width = 25;
      obstacle.y = 475;
      obstacle.x = 850;
      obstacle.velocity = 10;
      obstacle.acceleration = .05;
    }
  };
  window.onload = function() {
    // This is the main method
    WeatherMan.getLocation();
    //Allow weather data to be retrieved first 
    WeatherMan.init();
    
    
  };
})();
