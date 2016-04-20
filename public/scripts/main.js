(function() {
  "use strict";

  var settings;
  
  var coin = {
    radius: 20,
    y: 400,
    x: 850,
    velocity: 4,
    
    drawCoin: function(e) {
      WeatherMan.ctx.beginPath();
      WeatherMan.ctx.arc(coin.x, coin.y, coin.radius, 0, 2 * Math.PI);
      WeatherMan.ctx.fillStyle = "#ffff00";
      WeatherMan.ctx.fill();
      WeatherMan.ctx.closePath();
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
      WeatherMan.ctx.clearRect(0, 0, WeatherMan.canvas.width, WeatherMan.canvas.height);
      var image = new Image();
      image.src = "images/man.png";
      WeatherMan.ctx.drawImage(image,man.x,man.y);
      
    },
    jump: function() {
      if (man.inAir == 0) {
        man.velocity = 30;
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
      this.initListeners();
      this.getLocation();
      settings = self.settings;

      WeatherMan.canvas = document.querySelector('canvas');
      WeatherMan.ctx = WeatherMan.canvas.getContext("2d");
      // Enter gameLoop
      var gameLoop = WeatherMan.startLoop();
    },
    initListeners: function() {
      window.addEventListener('keypress', function(e) {
        var key = e.keyCode;

        switch (key) {
          case 32:
            e.preventDefault();
            man.jump();
        }
      }, false);
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
        self.settings.longitude = 86.91;
        self.getWeather();
      }

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error, options);
      }
      else {
        // Default West Lafayette
        self.settings.latitude = 40.43;
        self.settings.longitude = 86.91;
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
            self.settings.weather = 'thunderstorm';
          }
          else if ((code >= 5 && code <= 10) || code == 17 || code == 18) {
            self.settings.weather = 'sleet';
          }
          else if (code == 9 || code == 11 || code == 12 || code == 40) {
            self.settings.weather = 'rain';
          }
          else if ((code >= 13 && code <= 16) || code == 25 || code == 42) {
            self.settings.weather = 'snow';
          }
          else if (code == 20 || code == 21 || code == 22) {
            self.settings.weather = 'fog';
          }
          else if (code == 19 || code == 24) {
            self.settings.weather = 'wind';
          }
          else if (code >= 26 && code <= 30) {
            self.settings.weather = 'cloudy';
          }
          else if (code == 31 || code == 33) {
            self.settings.weather = 'clear';
          }
          else if (code == 32 || code == 34) {
            self.settings.weather = 'sunny';
          }
          else {
            // Default sunny
            self.settings.weather = 'sunny';
          }

          console.log("Weather: " + self.settings.weather);
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
      man.drawMan();
       
      obstacle.velocity = obstacle.velocity + obstacle.acceleration;
      obstacle.x = obstacle.x - obstacle.velocity;
      if (obstacle.x < 0 ) {
        obstacle.x = 850;
      }
      if (obstacle.velocity > 60) {
        obstacle.acceleration = 0; 
      }
      obstacle.drawObstacle();

      coin.x = coin.x - coin.velocity;
      if (coin.x < 150) {
        coin.x = 850;
        WeatherMan.score++;
        console.log(WeatherMan.score);
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
      WeatherMan.ctx.clearRect(0, 0, WeatherMan.canvas.width, WeatherMan.canvas.height);
      WeatherMan.ctx.font = "50px Arial";
      WeatherMan.ctx.fillStyle = "#000066";
      WeatherMan.ctx.fillText("Game Over, Score: " + WeatherMan.score, 100, 200);
    }
  };
  window.onload = function() {
    //This is the main method
    WeatherMan.init();
  };
})();
