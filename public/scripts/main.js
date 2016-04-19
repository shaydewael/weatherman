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
      weather_code: null
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
        // TODO: Error getting location, make a default
      }

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error, options);
      }
      else {
        // TODO: No location, make a default
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
          self.settings.weather_code = result.icon_code;
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
