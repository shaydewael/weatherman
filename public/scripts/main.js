(function() {
	"use strict";
	var settings;
	
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
			settings = this.settings;
			WeatherMan.canvas = document.querySelector('canvas');
			WeatherMan.ctx = WeatherMan.canvas.getContext("2d");
			//Enter gameLoop
			var gameLoop = WeatherMan.startLoop();
		},
		startLoop: function() {
			//Start game loop, draw objects and stuff

			//We won't use this parth, it's just to show how to draw circle :)
			WeatherMan.ctx.clearRect(0, 0, WeatherMan.canvas.width, WeatherMan.canvas.height);
			WeatherMan.ctx.beginPath();
			WeatherMan.ctx.arc(100, 100, 30, 0, Math.PI*2, true);
			WeatherMan.ctx.fillStyle = "#3498db";
			WeatherMan.ctx.fill();
			WeatherMan.ctx.closePath();
			//End non-use part
		}
	};
	window.onload = function() {
		//This is the main method
		WeatherMan.init();
	};
})();