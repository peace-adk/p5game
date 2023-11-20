//The Game Project Final//
var gameChar_x;
var gameChar_y;
var floorPos_y;
var canyons;
var treePos_y;
var isLeft = false;
var isRight = false;
var isFalling = false;
var isPlummeting = false;
var trees_x;
var clouds;
var mountains;
var mountains_base;
var cameraPosX;
var collectables;
var game_score;
var flagpole;
var lives;
var emit;
var enemies;
var jumpSound;
var gameSound;
var fallingSound;
var platforms;

var collectables_y_filter = {
  dir: "up",
  value: 0,
};

var collectables_next_y_dir = "down";


function preload() {
  soundFormats("mp3", "wav");

  //loading sounds here
  gameSound = loadSound("assets/gamesound_01.wav");
  gameSound.setVolume(0.1);

  jumpSound = loadSound("assets/jump.wav");
  jumpSound.setVolume(0.1);

  collectableSound = loadSound("assets/collectable.wav");
  collectableSound.setVolume(0.1);

  fallingSound = loadSound("assets/falling.wav");
  fallingSound.setVolume(0.1);
}

function setup() {
  createCanvas(1024, 576);
  gameSound.play();
  floorPos_y = (height * 3) / 4;
  lives = 3;
  game_score = 0;
  // The bounce ref property acts reference fixed reference to enable collectable float
  // Initialising collectables here to persist the game score after player falls

  collectables = [
    { bounce_ref: 380, x_pos: 80, y_pos: 380, size: 30, isFound: false },
    { bounce_ref: 380, x_pos: 280, y_pos: 380, size: 30, isFound: false },
    { bounce_ref: 380, x_pos: 560, y_pos: 380, size: 30, isFound: false },
    {
      bounce_ref: floorPos_y - 170,
      x_pos: 450,
      y_pos: floorPos_y - 170,
      size: 30,
      isFound: false,
    },
    { bounce_ref: 380, x_pos: 970, y_pos: 380, size: 30, isFound: false },
    {
      bounce_ref: floorPos_y - 150,
      x_pos: 1800,
      y_pos: floorPos_y - 150,
      size: 30,
      isFound: false,
    },
    {
      bounce_ref: floorPos_y - 170,
      x_pos: 700,
      y_pos: floorPos_y - 170,
      size: 30,
      isFound: false,
    },
    { bounce_ref: 380, x_pos: 1300, y_pos: 380, size: 30, isFound: false },
    {
      bounce_ref: 380,
      x_pos: 1600,
      y_pos: floorPos_y - 170,
      size: 30,
      isFound: false,
    },
    { bounce_ref: 338, x_pos: 1077, y_pos: 338, size: 30, isFound: false },
    {
      bounce_ref: floorPos_y - 170,
      x_pos: 1700,
      y_pos: floorPos_y - 170,
      size: 30,
      isFound: false,
    },
  ];

  // Volcano effect on mountain
  emit = new Emitter(
    width / 2,
    floorPos_y - 220,
    0,
    1,
    20,
    color(255, 185, 71, 100)
  );

  emit.startEmitter(450, 300);

  // Starting the game
  startGame();
}
function draw() {
  // Implementing scrolling
  cameraPosX = gameChar_x - width / 2;

  background(100, 155, 255); //blue sky
  noStroke();

  fill(145, 107, 100);
  rect(0, floorPos_y, width, height - floorPos_y);

  fill(129, 95, 93);
  rect(0, floorPos_y + 60, width, height - floorPos_y - 110);

  fill(129, 95, 93);
  rect(0, floorPos_y, width, height - floorPos_y - 110);

  fill(129, 95, 93);
  rect(0, floorPos_y + 120, width, height - floorPos_y - 110);

  fill(161, 213, 80);
  rect(0, floorPos_y, width, height - floorPos_y - 140);

  push();
  translate(-cameraPosX, 0);

  // Drawing the clouds
  drawClouds();

  //Drawing the mountains
  drawMountains();

  // Drawing the trees
  drawTrees();

  // drawing platforms
  for (var i = 0; i < platforms.length; i++) {
    platforms[i].draw();
  }

  emit.updateParticles();

  //collectable item - making the collectable float
  for (var i = 0; i < collectables.length; i++) {
    if (!collectables[i].isFound) {
      let bounce = collectables[i].size / 2;
      if (
        collectables[i].y_pos < collectables[i].bounce_ref + 30 &&
        collectables_next_y_dir === "down"
      ) {
        collectables[i].y_pos += 0.5;
        if (collectables[i].y_pos === 410) {
        }
        if (collectables[i].y_pos === collectables[i].bounce_ref + 30) {
          collectables_next_y_dir = "up";
        }
      } else if (
        collectables[i].y_pos > collectables[i].bounce_ref &&
        collectables_next_y_dir === "up"
      ) {
        collectables[i].y_pos -= 0.5;
        if (collectables[i].y_pos === 400) {
        }

        if (collectables[i].y_pos === collectables[i].bounce_ref) {
          collectables_next_y_dir = "down";
        }
      }
      drawCollectable(collectables[i]);
      checkCollectable(collectables[i]);
    }
  }

  //draw the canyon
  for (var i = 0; i < canyons.length; i++) {
    drawCanyon(canyons[i]);
    checkCanyon(canyons[i]);
  }

  //Drawing the game character
  drawCharacter();

  //Checking if the flagpole is reached only when it's false, once true, stops checking
  if (!flagpole.isReached) {
    checkFlagpole();
  }
  renderFlagpole();

  // Checking contact with enemies
  for (var i = 0; i < enemies.length; i++) {
    enemies[i].draw();

    let isContact = enemies[i].checkContact(gameChar_x, gameChar_y);

    if (isContact) {
      playerDied();
      if (lives > 0) {
        startGame();
        break;
      }
    }
  }

  pop();

  // Setting game score display on top left side of the canvas
  fill(255, 0, 0);
  noStroke();
  fill(0, 0, 0, 90);
  rect(35, 20, 110, 30);
  fill(255);
  textSize(18);
  text("Score: " + game_score + "x", 40, 40);

  //Drawing collectable icon for score keeping
  fill(255, 220, 83);
  ellipse(132, 35, 20, 20);
  fill(241, 160, 5);
  ellipse(132, 35, 15, 15);
  fill(255, 216, 18);
  ellipse(132, 35, 4, 8);

  //Checking if player is dead
  checkPlayerDie();

  // Displaying "game over" text
  if (lives < 1) {
	push();
    rectMode(CENTER);
    fill(0, 0, 0, 50);
    rect(width / 2, height / 2 - 5, 600, 70);
    fill(255);
    text("Game over! Press space to restart", width / 3, height / 2);
    pop();
    return;
  }

  //Checking if the flagpole has been reached
  if (flagpole.isReached) {
    push();
    rectMode(CENTER);
    fill(0, 0, 0, 50);
    rect(width / 2, height / 2 - 5, 800, 70);
    fill(255);
    text("Level complete! Press space to continue", width / 2.5, height / 2);
    pop();
    return;
  }

  for (var i = 0; i < lives; i++) {
    fill(240, 200, 160);
    stroke(0);
    ellipse(25 * i + 45, 70, 20);
  }

  ///////////INTERACTION CODE//////////
  // moving left
  if (isLeft == true) {
    gameChar_x -= 5;
    // movingSound.play();
  }

  // moving right
  if (isRight == true) {
    gameChar_x += 5;
  }

  // falling interaction
  if (gameChar_y < floorPos_y) {
    let isContact = false;
    for (let i = 0; i < platforms.length; i++) {
      if (platforms[i].checkContact(gameChar_x, gameChar_y) == true) {
        isContact = true;
        break;
      }
    }
    if (!isContact) {
      gameChar_y += 5;
      isFalling = true;
    } else {
      isFalling = false;
    }
  } else {
    isFalling = false;
  }
  
}

function keyPressed() {
  // if statements to control the animation of the character when keys are pressed.
  if (isPlummeting == false) {
    // "A" or "ArrowRight" to move left
    if (keyCode == 65 || keyCode == 37) {
      isLeft = true;
    }

    // "D" or "ArrowLeft" to move right
    else if (keyCode == 68 || keyCode == 39) {
      isRight = true;
    }
    //Jumping interaction
    else if ((keyCode == 87 || keyCode == 38) && isFalling == false) {
      gameChar_y = gameChar_y - 200;
      isFalling = true;

      jumpSound.play();
    }

    //On pressing space bar on keyboard, restart game while keeping game score and lives
    if (flagpole.isReached) {
      if (keyCode == 32) {
        startGame();
      }
    }
  }

  //On game over, restart game by reloading tab to re-initialize all values
  if (lives < 1) {
    if (keyCode == 32) {
      window.location.reload();
    }
  }
}

function keyReleased() {
  // if statements to control the animation of the character when keys are released.
  if (keyCode == 65 || keyCode == 37) {
    isLeft = false;
  } else if (keyCode == 68 || keyCode == 39) {
    isRight = false;
  }
}

function drawClouds() {
  for (var i = 0; i < clouds.length; i++) {
    // cloud shape
    fill(255);
    ellipse(clouds[i].x_pos, clouds[i].y_pos, clouds[i].width);
    ellipse(clouds[i].x_pos - 40, clouds[i].y_pos, clouds[i].width - 20);
    ellipse(clouds[i].x_pos + 40, clouds[i].y_pos, clouds[i].width - 50);
    // Making the cloud move
    clouds[i].x_pos -= 0.1;
    //End
  }
}

function drawMountains() {
  for (var i = 0; i < mountains.length; i++) {
    fill(25);
    //The mountains have a shadow effect hence the three triangle shapes of different shades of grey.
    triangle(
      mountains[i].x_pos - 50,
      mountains[i].y_pos,
      mountains[i].x_pos - 50,
      mountains[i].y_pos - 175,
      mountains[i].x_pos + 100,
      mountains[i].y_pos
    );
    fill(41);
    triangle(
      mountains[i].x_pos,
      mountains[i].y_pos,
      mountains[i].x_pos - 100,
      mountains[i].y_pos - 235,
      mountains[i].x_pos + 84,
      mountains[i].y_pos
    );
    fill(80);
    triangle(
      mountains[i].x_pos - 200,
      mountains[i].y_pos,
      mountains[i].x_pos - 100,
      mountains[i].y_pos - 235,
      mountains[i].x_pos,
      mountains[i].y_pos
    );
  }
}

//Function to draw the trees
function drawTrees() {
  for (var i = 0; i < trees_x.length; i++) {
    //branches
    fill(113, 156, 64);
    ellipse(trees_x[i] + 80, treePos_y - 82, 120, 120);

    fill(113, 156, 64);
    ellipse(trees_x[i] - 50, treePos_y - 82, 120, 120);

    //trunk
    fill(89, 59, 57);
    rect(trees_x[i] - 10, treePos_y - 20, 70, 165);

    fill(107, 70, 40);
    rect(trees_x[i], treePos_y - 10, 50, 155);

    fill(129, 95, 93, 70);
    rect(trees_x[i] + 10, treePos_y, 30, 144);

    noStroke();
    fill(255);
    //branches
    fill(113, 156, 64);
    ellipse(trees_x[i] + 20, treePos_y - 102, 190, 210);
    //branches-2
    fill(127, 178, 65);
    ellipse(trees_x[i], treePos_y - 150, 90, 50);

    //branches-2
    fill(127, 178, 65);
    ellipse(trees_x[i] + 100, treePos_y - 70, 50, 50);

    //branches-2
    fill(127, 178, 65);
    ellipse(trees_x[i] - 40, treePos_y - 80, 120, 90);
  }
}

function drawCollectable(t_collectable) {
  if (t_collectable.isFound == false) {
    let v = createVector(t_collectable.x_pos, t_collectable.y_pos);
    fill(255, 216, 18);
    ellipse(v.x, v.y, t_collectable.size + 10, t_collectable.size + 20);
    fill(241, 160, 5);
    ellipse(v.x, v.y, t_collectable.size, t_collectable.size + 14);
    fill(37, 81, 55, 40);
    ellipse(v.x, v.y, t_collectable.size - 15, t_collectable.size + 12);
    fill(255, 220, 83);
    ellipse(v.x, v.y, t_collectable.size - 20, t_collectable.size + 8);
  }
}

// Checking the collectable and playing sound when it has been collected
function checkCollectable(t_collectable) {
  if (
    dist(gameChar_x, gameChar_y, t_collectable.x_pos, t_collectable.y_pos) < 50
  ) {
    t_collectable.isFound = true;
    game_score += 1;
    collectableSound.play();
  }
}

function drawCanyon(t_canyon) {
  fill(100, 155, 255);
  rect(t_canyon.x_pos, 432, t_canyon.width, 340);
}

// Killing the player
function playerDied() {
  isPlummeting = true;
  if (lives > 0) {
    lives -= 1;
  }
  isLeft = false;
  isRight = false;
  var offset = 0;
  gameSound.stop();
  collectableSound.stop();
  fallingSound.play();

  while (offset <= 200) {
    gameChar_y -= 0.125;
    offset += 0.125;
  }
}

function checkCanyon(t_canyon) {
  // interaction for falling over the canyon
  if (!isPlummeting) {
    if (
      gameChar_x > t_canyon.x_pos &&
      gameChar_x < t_canyon.x_pos + t_canyon.width &&
      gameChar_y >= floorPos_y
    ) {
      playerDied();
    }
  }
  if (isPlummeting) {
    gameChar_y += 1;
  }
}

function renderFlagpole() {
  push();
  strokeWeight(5);
  stroke(190);
  line(flagpole.x_pos, floorPos_y, flagpole.x_pos, floorPos_y - 250);

  fill(248, 140, 39);
  ellipse(flagpole.x_pos, floorPos_y - 250, 15, 15);

  fill(248, 181, 53);
  noStroke();

  if (flagpole.isReached) {
    triangle(
      flagpole.x_pos,
      floorPos_y - 240,
      flagpole.x_pos,
      floorPos_y - 180,
      flagpole.x_pos + 60,
      floorPos_y - 220
    );
  } else {
    triangle(
      flagpole.x_pos,
      floorPos_y,
      flagpole.x_pos,
      floorPos_y - 60,
      flagpole.x_pos + 60,
      floorPos_y - 40
    );
  }
  pop();
}

function checkFlagpole() {
  var d = abs(gameChar_x - flagpole.x_pos);
  if (d < 15) {
    flagpole.isReached = true;
  }
}

function checkPlayerDie() {
  if (gameChar_y >= 576) {
    if (lives > 0) {
      startGame();
      isPlummeting = false;
    }
  }
}

// Start game function
function startGame() {
  if (!gameSound.isPlaying()) {
    gameSound.play();
  }

  // Initializing the clouds variable
  clouds = [
    { x_pos: -80, y_pos: 70, width: 90 },
    { x_pos: 100, y_pos: 70, width: 90 },
    { x_pos: 350, y_pos: 90, width: 100 },
    { x_pos: 520, y_pos: 60, width: 80 },
    { x_pos: 1000, y_pos: 70, width: 80 },
    { x_pos: 1280, y_pos: 85, width: 80 },
    { x_pos: 1780, y_pos: 85, width: 80 },
    { x_pos: 1960, y_pos: 85, width: 80 },
    { x_pos: 2400, y_pos: 85, width: 80 },
    { x_pos: 2800, y_pos: 85, width: 80 },
  ];

  mountains_base = height - 144;

  // Initializing the mountains variable
  mountains = [
    { x_pos: 600, y_pos: mountains_base },
    { x_pos: 1100, y_pos: mountains_base },
    { x_pos: 430, y_pos: mountains_base },
    { x_pos: 1680, y_pos: mountains_base },
    { x_pos: 2300, y_pos: mountains_base },
    { x_pos: 2700, y_pos: mountains_base },
  ];

  // Making an array of tree positions
  trees_x = [-900, -500, -70, 300, 700, 960, 1250, 1700, 2000, 2180, 2700];

  gameChar_x = width / 2;
  gameChar_y = floorPos_y;

  canyons = [
    { x_pos: 120, width: 60 },
    { x_pos: 840, width: 60 },
    { x_pos: 1400, width: 60 },
  ];
  treePos_y = height / 2;

  // To control background scrolling
  cameraPosX = 0;

  flagpole = {
    isReached: false,
    x_pos: 2300,
  };

  platforms = [];
  platforms.push(createPlatforms(180, floorPos_y - 100, 100, 224));
  platforms.push(createPlatforms(400, floorPos_y - 100, 200, 200));
  platforms.push(createPlatforms(650, floorPos_y - 120, 100, 160));
  platforms.push(createPlatforms(1000, floorPos_y - 100, 200, 240));
  platforms.push(createPlatforms(1600, floorPos_y - 100, 200, 190));

  enemies = [];
  enemies.push(new Enemy(100, floorPos_y - 10, 100));
  enemies.push(new Enemy(590, floorPos_y - 10, 60));
  enemies.push(new Enemy(1150, floorPos_y - 10, 80));
  enemies.push(new Enemy(1900, floorPos_y - 10, 130));
  enemies.push(new Enemy(2500, floorPos_y - 10, 80));
}

// Factory pattern for creating platforms
function createPlatforms(x, y, length, color) {
  var p = {
    x: x,
    y: y,
    length: length,
    draw: function () {
      fill(0, 0, 1);
      rect(this.x, this.y + 2, this.length, 2);
      fill(0, 201, 1);
      rect(this.x, this.y + 4, this.length, 12);
      //details
      fill(5, 117, 72);
      rect(this.x, this.y + 12, this.length, 2);

      // brown soil part//
      fill(color, 152, 88);
      rect(this.x, this.y + 16, this.length, 20);

      fill(7, 0, 0);
      rect(this.x, this.y + 14, this.length, 2);
    },

    checkContact: function (gc_x, gc_y) {
      if (gc_x > this.x && gc_x < this.x + this.length) {
        var d = this.y - gc_y;
        if (d >= 0 && d < 5) {
          return true;
        }
      }
      return false;
    },
  };
  return p;
}

//Constructor function for creating enemies
function Enemy(x, y, range) {
  this.x = x;
  this.y = y;
  this.range = range;

  this.currentX = x;
  this.inc = 1;

  this.update = function () {
    this.currentX += this.inc;
    if (this.currentX >= this.x + this.range) {
      this.inc = -1;
    } else if (this.currentX < this.x) {
      this.inc = 1;
    }
  };

  this.draw = function () {
    this.update();
    stroke(0, 0, 0);
    //legs
    fill(237, 212, 157);
    ellipse(this.currentX, this.y, 10, 20);
    ellipse(this.currentX + 20, this.y, 10, 20);

    //body
    fill(237, 212, 157);
    rect(this.currentX - 15, this.y - 42, 50, 40, 20);

    //eyes
    fill(255, 255, 196);
    ellipse(this.currentX + 4, this.y - 25, 10, 10);
    ellipse(this.currentX + 24, this.y - 25, 10, 6);

    //mouth
    fill(251, 160, 193);
    rect(this.currentX + 10, this.y - 15, 8, 2);

    //headshell
    fill(206, 42, 70);
    rect(this.currentX - 30, this.y - 58, 80, 30, 15);

    //ornaments
    fill(255);
    ellipse(this.currentX - 10, this.y - 45, 20, 15);
    ellipse(this.currentX + 20, this.y - 40, 15, 15);
    ellipse(this.currentX + 40, this.y - 45, 15, 15);
  };

  this.checkContact = function (gc_x, gc_y) {
    if (lives < 1) return;
    var d = dist(gc_x, gc_y, this.currentX, this.y);
    if (d < 40) {
      return true;
    }
    return false;
  };
}

//Function for drawing the game character
function drawCharacter() {
  if (isLeft && isFalling) {
    //jumping-left code
    fill(240, 193, 160);
    stroke(0);
    ellipse(gameChar_x, gameChar_y - 55, 30, 30);

    //eyes
    fill(34, 16, 31);
    rect(gameChar_x - 8, gameChar_y - 60, 4, 6);

    //body
    fill(233, 16, 202);
    rect(gameChar_x - 8, gameChar_y - 40, 16, 30);

    //legs
    fill(240, 193, 160);
    rect(gameChar_x, gameChar_y - 10, 20, 9);
    //hand
    rect(gameChar_x - 3, gameChar_y - 75, 6, 34);
  } else if (isRight && isFalling) {
    //jumping-right code
    //head
    fill(240, 193, 160);
    stroke(0);
    ellipse(gameChar_x, gameChar_y - 55, 30, 30);

    //eyes
    fill(34, 16, 31);
    rect(gameChar_x + 4, gameChar_y - 60, 4, 6);

    //body
    fill(233, 16, 202);
    rect(gameChar_x - 8, gameChar_y - 40, 16, 30);

    //legs
    fill(240, 193, 160);
    rect(gameChar_x - 20, gameChar_y - 10, 20, 9);
    //hand
    rect(gameChar_x - 3, gameChar_y - 75, 6, 34);
  } else if (isLeft) {
    //walking left code
    //head
    fill(240, 193, 160);
    stroke(0);
    ellipse(gameChar_x, gameChar_y - 55, 30, 30);

    //eyes
    fill(34, 16, 31);
    rect(gameChar_x - 8, gameChar_y - 60, 4, 6);
    // rect(gameChar_x + 2, gameChar_y - 60, 4,6);

    //body
    fill(233, 16, 202);
    rect(gameChar_x - 8, gameChar_y - 40, 16, 30);

    //legs
    fill(240, 193, 160);
    //left
    rect(gameChar_x - 4, gameChar_y - 10, 6, 12);
    //hand
    rect(gameChar_x - 3, gameChar_y - 40, 6, 20);
  } else if (isRight) {
    //walking right code
    //head
    fill(240, 193, 160);
    stroke(0);
    ellipse(gameChar_x, gameChar_y - 55, 30, 30);

    //eyes
    fill(34, 16, 31);
    rect(gameChar_x + 4, gameChar_y - 60, 4, 6);

    //body
    fill(233, 16, 202);
    rect(gameChar_x - 8, gameChar_y - 40, 16, 30);

    //legs
    fill(240, 193, 160);
    //left
    rect(gameChar_x - 4, gameChar_y - 10, 6, 12);
    //hand
    rect(gameChar_x - 3, gameChar_y - 40, 6, 20);
  } else if (isFalling || isPlummeting) {
    //jumping facing forwards code
    //head
    fill(240, 193, 160);
    stroke(0);
    ellipse(gameChar_x, gameChar_y - 55, 30, 30);

    //eyes
    fill(34, 16, 31);
    rect(gameChar_x - 6, gameChar_y - 60, 4, 6);
    rect(gameChar_x + 2, gameChar_y - 60, 4, 6);

    //body
    fill(233, 16, 202);
    rect(gameChar_x - 13, gameChar_y - 40, 26, 30);

    //legs
    fill(240, 193, 160);
    //left
    rect(gameChar_x - 10, gameChar_y - 10, 6, 9);
    //right
    rect(gameChar_x + 5, gameChar_y - 10, 6, 9);

    //hands
    //left
    rect(gameChar_x - 20, gameChar_y - 55, 6, 20);
    //right
    rect(gameChar_x + 14, gameChar_y - 55, 6, 20);
  } else {
    //standing front facing code
    //head
    fill(240, 193, 160);
    stroke(0);
    ellipse(gameChar_x, gameChar_y - 55, 30, 30);

    //eyes
    fill(34, 16, 31);
    rect(gameChar_x - 6, gameChar_y - 60, 4, 6);
    rect(gameChar_x + 2, gameChar_y - 60, 4, 6);

    //body
    fill(233, 16, 202);
    rect(gameChar_x - 13, gameChar_y - 40, 26, 30);

    //legs
    fill(240, 193, 160);
    //left
    rect(gameChar_x - 10, gameChar_y - 10, 6, 12);
    //right
    rect(gameChar_x + 5, gameChar_y - 10, 6, 12);

    //hands
    //left
    rect(gameChar_x - 20, gameChar_y - 40, 6, 20);
    //right
    rect(gameChar_x + 14, gameChar_y - 40, 6, 20);
  }
}

// constructor function for drawing volcano fire fluid - particle
function Particle(x, y, xSpeed, ySpeed, size, colour) {
  this.x = x;
  this.y = y;
  this.xSpeed = xSpeed;

  this.ySpeed = ySpeed;
  this.size = size;
  this.colour = colour;
  this.age = 0;

  this.drawParticle = function () {
    fill(colour);
    ellipse(this.x, this.y, this.size);
  };

  this.updateParticle = function () {
    this.x += this.xSpeed;
    this.y += this.ySpeed;
    this.age++;
  };
}

// Creating the fire particle system
// constructor function for drawing volcano fire fluid - emitter
function Emitter(x, y, xSpeed, ySpeed, size, colour) {
  this.x = x;
  this.y = y;
  this.xSpeed = xSpeed;
  this.ySpeed = ySpeed;
  this.size = size;
  this.colour = colour;

  this.startParticles = 0;
  this.lifetime = 0;

  this.particles = [];

  this.addParticle = function () {
    var p = new Particle(
      random(this.x - 10, this.x + 10),
      random(this.y - 10, this.y + 10),
      random(this.xSpeed - 1, this.xSpeed + 1),
      random(this.ySpeed - 1, this.ySpeed + 1),
      random(this.size - 4, this.size + 4),
      this.colour
    );
    return p;
  };
  this.startEmitter = function (startParticles, lifetime) {
    this.startParticles = startParticles;
    this.lifetime = lifetime;

    //start emitter with initial particles
    for (var i = 0; i < startParticles; i++) {
      this.particles.push(this.addParticle());
    }
  };

  this.updateParticles = function () {
    //iterate through particles and draw to the screen
    var deadParticles = 0;
    for (var i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].drawParticle();
      this.particles[i].updateParticle();

      if (this.particles[i].age > random(0, this.lifetime)) {
        this.particles.splice(i, 1);
        deadParticles++;
      }
    }
    if (deadParticles > 0) {
      for (var i = 0; i < deadParticles; i++) {
        this.particles.push(this.addParticle());
      }
    }
  };
}
