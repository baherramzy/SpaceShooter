
var requestAnimFrame = (function() { // cross browser requestAnimationFrame (to compensate for varying frame rates)
	return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function(callback) {
			window.setTimeout(callback, 1000 / 60);
		};
})();

/// HTML ////
var div = document.createElement("div");
div.top = "50px";
div.left = "200px";
document.body.appendChild(div);
var canvas = document.createElement("canvas");
var ctxt = canvas.getContext('2d');
canvas.width = 320;
canvas.height = 512;
//document.body.appendChild(canvas);
div.appendChild(canvas);
var p = document.createElement("p");
var textNode = document.createTextNode("Controls: Left/Right/Up/Down arrow keys to move, hold Spacebar to fire.");
p.appendChild(textNode);
div.appendChild(p);
var button = document.createElement("input");
button.type = "button";
button.value = "Restart";
button.onclick = function() {
	window.location.reload();
};
document.body.appendChild(button);

/// Images ////

// Background Image
var bgReady = false;
var bgImg = new Image();
bgImg.onload = function() {
	bgReady = true;
};
bgImg.src = "img/Background.png";

// Player
var PlayerReady = false;
var PlayerImg = new Image();
PlayerImg.onload = function() {
	PlayerReady = true;
};
PlayerImg.src = "img/player.png";

// Enemy
var EnemyReady = false;
var EnemyImg = new Image();
EnemyImg.onload = function() {
	EnemyReady = true;
}
EnemyImg.src = "img/enemy.png";

// Bullet
var BulletReady = false;
var BulletImg = new Image();
BulletImg.onload = function() {
	BulletReady = true;
};
BulletImg.src = "img/bullet.png";

//// Game variables ////
var Score = 0;

//// Game Objects ////
var hero = {
	speed: 200, // pixels per second
	x: canvas.width/2 - 45, // initial x position
	y: canvas.height - 80 // initial y position
};

function Enemy() {
	this.speed = 0.12; // enemy movement speed
	this.x = Math.random() * (canvas.width - 60); // initial x position
	this.y = 0; // initial y position
	this.hasCollided = false; // collision flag
	this.draw = function() {
		ctxt.drawImage(EnemyImg,this.x,this.y);
	}
	this.move = function() {
		this.y += this.speed; // increment y position by speed value

		// Collision detection (with player)
		if(this.y + EnemyImg.height >= hero.y && this.y + EnemyImg.height < hero.y + PlayerImg.height &&
			this.x + EnemyImg.width/2 > hero.x && this.x + EnemyImg.width/2 < hero.x + PlayerImg.width)
			GameOver();

		this.speed += 0.002; // accelerate towards player
	}
}

var enemySpawnRate = 240; // spawn every 240 frames
var spawnRateCountdown = enemySpawnRate;
var enemies = []; // array of enemies

function Bullet() {
	this.speed = 1.5; // initial bullet movement speed
	this.x = hero.x + PlayerImg.width/2; // initial x position (ship nose)
	this.y = hero.y - 10; // initial y position (slightly ahead of ship nose)
	this.hasCollided = false; // collision flag
	this.draw = function() {
		ctxt.drawImage(BulletImg, // source image
				0, // source image x
				0, // source image y
				BulletImg.width/2, // source width
				BulletImg.height, // source height
				this.x, // destination x (canvas x)
				this.y, // destination y (canvas y)
				BulletImg.width/2, // destination width
				BulletImg.height); // destination height
	}
	this.move = function() {
		this.y -= this.speed; // move bullet upwards by subtracting speed value

		// Collision detection (with enemies)
		for(var i = 0; i < enemies.length; ++i) {
			if(this.x > enemies[i].x && this.x < enemies[i].x + EnemyImg.width // horizontal check
				&& this.y > enemies[i].y && this.y < enemies[i].y + EnemyImg.height) {// vertical check
				this.hasCollided = true; // mark bullet as collided
				enemies[i].hasCollided = true; // mark enemy as collided

				Score++; // increment score
			}
		}
	}
}

var bulletSpawnRate = 60; // spawn bullet every 60 frames
var bulletRateCountdown = bulletSpawnRate;
var bullets = []; // array of bullets

//// Keyboard controls ////
var keysDown = {};

addEventListener("keydown",function(e) {
	keysDown[e.keyCode] = true;
}, false); // register keydown event listener to detect key presses

addEventListener("keyup",function(e) {
	delete keysDown[e.keyCode];
}, false); // register keyup event listener to detect key releases

var GameOver = function() {
	PlayerReady = false;
	EnemyReady = false;
	enemySpawnRate = 0;
	keysDown = null;

	ctxt.drawImage(bgImg,0,0);

	// Style and draw Game Over text and Score
	ctxt.font = "Bold 20pt Calibri";
	ctxt.fillStyle = "Red";
	ctxt.fillText("GAME OVER", canvas.width/2 - 70, canvas.height/2);
	ctxt.fillStyle = "White";
	ctxt.fillText("Score: " + Score.toString(), canvas.width/2 - 50, canvas.height/2 + 40);
}

// Update game objects
var update = function(dt) {
	if(38 in keysDown && hero.y > 0) { // Up
		hero.y -= hero.speed * dt;
	}

	if(40 in keysDown && hero.y < canvas.height - PlayerImg.height) { // Down
		hero.y += hero.speed * dt;
	}

	if(37 in keysDown && hero.x > 0) { // Left
		hero.x -= hero.speed * dt;
	}

	if(39 in keysDown && hero.x < canvas.width - PlayerImg.width) { // Right
		hero.x += hero.speed * dt;
	}

	if(32 in keysDown) {
		bulletRateCountdown -= 1;
		if(bulletRateCountdown == 0) {
			var B = new Bullet(); // Spawn new bullet and add to bullet array
			bullets.push(B);
			bulletRateCountdown = bulletSpawnRate; // reset bullet spawn countdown
		}
	}
}

var scrollY = 0; // background image scroll velocity

var render = function() {
	window.requestAnimFrame;

	if(bgReady) {
		ctxt.clearRect(0,0,canvas.width,canvas.height);

		ctxt.drawImage(bgImg, 0, scrollY); // draw bg image at top of canvas, initially
		ctxt.drawImage(bgImg, 0, scrollY-bgImg.height); // draw another bg image directly above the first one
 
		if (scrollY > bgImg.height) {
		    scrollY = 0;
		}

		scrollY += 0.2; // scroll down to achieve "move forward" effect
	}
	
	if(PlayerReady) {
		ctxt.drawImage(PlayerImg,hero.x,hero.y); // draw space ship at its x and y co-ordinates

		for(var i = 0; i < bullets.length; ++i) {
			if(!bullets[i].hasCollided) { // if bullet has not collided, continue drawing and moving it
				bullets[i].draw();
				bullets[i].move();
			}
			else {
				bullets.splice(i,1); // if bullet has collided, remove from array of bullets
			}
		}
	}

	if(EnemyReady) {
		spawnRateCountdown -= 1;
		if(spawnRateCountdown == 0) { 
			if(enemySpawnRate - 5 >= 100) {
				enemySpawnRate -= 5; // increase spawn rate to raise difficulty
			}
			else {
				Enemy.speed += 0.002; // increase enemy speed to increase difficulty further
			}
			spawnRateCountdown = enemySpawnRate; // reset spawn countdown

			var E = new Enemy(); // Instantiate new enemy object
			enemies.push(E); // add new enemy object to array of enemies
		}
	}

	for(var i = 0; i < enemies.length; ++i) {
		if(!enemies[i].hasCollided) { // if enemy has not collided, continue drawing and moving it
			enemies[i].draw();
			enemies[i].move();
		}
		else {
			enemies.splice(i,1); // if enemy has previously collided, remove from array of enemies
		}
	}

	// Draw score 
	ctxt.font = '18pt Calibri';
	ctxt.fillStyle = "White";
	ctxt.fillText("Score: "+ Score.toString(), canvas.width - 100, 20);
}

var main = function() {
	var currentTime = Date.now();
	var delta = currentTime - prevTime;
	
	update(delta/1000);
	render();
	
	prevTime = currentTime;
}

// Play!
var prevTime = Date.now();
setInterval(main,1);