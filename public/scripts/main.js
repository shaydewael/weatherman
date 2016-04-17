(function() {
  "use strict";
  var settings;

  var man = {
      height: 100,
      width: 50,
      x: 50,
      y: 400,
      inAir: 0,
      gravity: 4,
      velocity: 0,

    drawMan: function(e) {
      WeatherMan.ctx.clearRect(0, 0, WeatherMan.canvas.width, WeatherMan.canvas.height);
      WeatherMan.ctx.beginPath();
      WeatherMan.ctx.rect(man.x, man.y, man.width, man.height);
      //WeatherMan.ctx.fillStyle = "#3498db";
      WeatherMan.ctx.stroke();
      WeatherMan.ctx.closePath();
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
    //Game canvas
    canvas: 0,
    ctx: 0,
    //Boundaries
    leftWall: 0,
    rightWall: 0,
    topWall: 0,
    bottomWall: 0,
    //Settings
    settings: {
      //For canvas
      width: "850px",
      height: "500px",
      // Weather location
      location: 0
    },
    init: function() {
            this.initListeners();
            settings = this.settings;
            WeatherMan.canvas = document.querySelector('canvas');
            WeatherMan.ctx = WeatherMan.canvas.getContext("2d");
            //Enter gameLoop
            var gameLoop = WeatherMan.startLoop();
          },
    initListeners: function() {
                     window.addEventListener('keypress', function(e) {
                       var key = e.keyCode;

                       switch(key) {
                         case 32:
                           e.preventDefault();
                           man.jump();

                       }
                     }, false);
                   },
    startLoop: function() {
            this.interval = setInterval(function() {
              WeatherMan.loop();
            }, 1000/25);
           },
    loop: function() {
                 //Start game loop, draw objects and stuff
                 if (man.inAir == 1) {
                    man.velocity = man.velocity - man.gravity;
                    if (man.y - man.velocity < 400 ) {
                      man.y = man.y - man.velocity;
                    }
                    else {
                      man.y = 400;
                      man.inAir = 0;
                      man.velocity = 0;
                    }
                 }
                 man.drawMan();
               }
  };
  window.onload = function() {
    //This is the main method
    WeatherMan.init();
  };
})();
