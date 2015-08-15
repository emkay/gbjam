(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var boot = require('./lib/boot')
var mainMenu = require('./lib/main-menu')
var gameLoop = require('./lib/game-loop')

var screenX = 160
var screenY = 144

var game = new Phaser.Game(screenX, screenY, Phaser.CANVAS)

game.state.add('boot', boot)
game.state.add('mainMenu', mainMenu)
game.state.add('gameLoop', gameLoop)

game.state.start('boot')

},{"./lib/boot":2,"./lib/game-loop":3,"./lib/main-menu":4}],2:[function(require,module,exports){
function Boot(game) {
  this.game = game
}

Boot.prototype.preload = function preload() {
  this.game.load.audio('intro', 'assets/intro.mp3')
  this.game.load.image('title', 'assets/title-screen.png')
  this.game.load.image('gameOver', 'assets/game-over.png')
  this.game.load.image('space', 'assets/space.png')
  this.game.load.image('starsDim', 'assets/space_stars_dim.png')
  this.game.load.image('starsBright', 'assets/space_stars_bright.png')
  this.game.load.image('bullet', 'assets/bullet.png')
  this.game.load.image('ship', 'assets/ship.png')
  this.game.load.image('asteroidSmall', 'assets/asteroid_small.png')
  this.game.load.image('asteroidMed', 'assets/asteroid_medium.png')
  this.game.load.spritesheet('slime', 'assets/space-slime.png', 10, 12)
  this.game.load.spritesheet('explosion', 'assets/explosion.png', 16, 16)
  this.game.load.spritesheet('m2zak', 'assets/m2zak.png', 16, 16)
}

Boot.prototype.create = function create() {
  this.game.world.setBounds(0, 0, 1920, 1200)
  this.game.renderer.clearBeforeRender = false
  this.game.renderer.roundPixels = true

  this.game.physics.startSystem(Phaser.Physics.ARCADE)

  this.game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE
  this.game.scale.setUserScale(3, 3)
  this.game.state.start('mainMenu')
}

module.exports = Boot

},{}],3:[function(require,module,exports){
function GameLoop(game) {
  this.game = game
}

GameLoop.prototype.create = function create() {
  var self = this

  this.space = this.game.add.tileSprite(0, 0, 1920, 1200, 'space')
  this.starsDim = this.game.add.tileSprite(0, 0, 1920, 1200, 'starsDim')
  this.starsBright = this.game.add.tileSprite(0, 0, 1920, 1200, 'starsBright')

  this.explosions = this.game.add.group()
  this.explosions.createMultiple(30, 'explosion')
  this.explosions.forEach(function (explosion) {
    explosion.anchor.x = 0.5
    explosion.anchor.y = 0.5
    explosion.animations.add('boom')
  })
 
  this.bullets = this.game.add.group()
  this.bullets.enableBody = true
  this.bullets.physicsBodyType = Phaser.Physics.ARCADE
  this.bullets.createMultiple(40, 'bullet')
  this.bullets.setAll('anchor.x', 0.5)
  this.bullets.setAll('anchor.y', 0.5)
  this.bullet = null
  this.bulletTime = 0

  this.createAsteroidField()
  this.createSlimeGang()
 
  this.player = this.game.add.sprite(75, 75, 'ship')
  this.player.anchor.set(0.5, 0.5)
  this.player.health = 20
  this.player.damage = function damage() {
    self.player.health -= 1
    if (self.player.health <= 0) {
      self.player.kill()
      return true
    }

    return false
  }

  this.m2zak = this.game.add.sprite(100, 100, 'm2zak')

  this.physics.enable(this.player, Phaser.Physics.ARCADE)
  this.physics.enable(this.m2zak, Phaser.Physics.ARCADE)

  this.player.body.collideWorldBounds = true

  this.player.body.drag.set(100)
  this.player.body.maxVelocity.set(100)
  this.cursors = this.game.input.keyboard.addKeys({'up': Phaser.Keyboard.W, 'down': Phaser.Keyboard.S, 'left': Phaser.Keyboard.A, 'right': Phaser.Keyboard.D})
  this.fireButton = this.game.input.keyboard.addKey(Phaser.Keyboard.J)
  this.camera.follow(this.player)

  /*
  state.m2zak.health = 100
  state.m2zak.damage = function damage() {
    state.m2zak.health -= 1
    if (state.m2zak.health <= 0) {
      state.m2zak.kill()
      return true
    }

    return false
    }
    */
  //state.m2zak.animations.add('thrusters')
  //state.m2zak.animations.play('thrusters')
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

GameLoop.prototype.update = function update() {
  var self = this

  if (this.player.alive) {
    if (this.cursors.up.isDown) {
      this.game.physics.arcade.accelerationFromRotation(this.player.rotation, 80, this.player.body.acceleration)
    } else {
      this.player.body.acceleration.set(0)
    }
    
    if (this.cursors.left.isDown) {
      this.player.body.angularVelocity = -300
    } else if (this.cursors.right.isDown) {
      this.player.body.angularVelocity = 300
    } else {
      this.player.body.angularVelocity = 0
    }
  } else {
    self.restartGame()
  }

  if (this.fireButton.isDown) {
    if (this.time.now > this.bulletTime) {
      this.bullet = this.bullets.getFirstExists(false)

      if (this.bullet) {
        this.bullet.reset(this.player.body.x + 10, this.player.body.y + 10)
        this.bullet.lifespan = 1000
        this.bullet.rotation = this.rotation
        this.physics.arcade.velocityFromRotation(this.player.rotation, 400, this.bullet.body.velocity)
        this.bulletTime = this.time.now + 400
      }
    }
  }

  // move stuff

  //state.slime.body.x += randomInt(-1, 1)
  //state.slime.body.y += randomInt(-1, 1)

  this.game.world.wrap(this.player, 0, true)

  // collision stuff
  function ch(thing1, thing2) {
    var explosion

    if (thing1.key === 'bullet') {
      thing2.kill()
      explosion = self.explosions.getFirstExists(false)
      explosion.reset(thing2.body.x, thing2.body.y)
      explosion.play('boom', 8, false, true)
    }

    if (thing1.key === 'ship') {
      thing1.damage()
    }
  }
  
  this.game.physics.arcade.collide(this.asteroids, this.asteroids, ch)
  this.game.physics.arcade.collide(this.player, this.asteroids, ch)
  this.game.physics.arcade.collide(this.bullet, this.asteroids, ch)
  this.game.physics.arcade.collide(this.slimes, this.asteroids, ch)

  this.game.physics.arcade.collide(this.bullet, this.slimes, ch)
  this.game.physics.arcade.collide(this.player, this.slimes, ch)
}

GameLoop.prototype.createAsteroidField = function createAsteroidField() {
  var isSmall
  var type
  var x
  var y
  var a
  var i
  this.asteroids = this.game.add.group()
  this.asteroids.enableBody = true
  this.asteroids.physicsBodyType = Phaser.Physics.ARCADE

  for (i = 0; i < 40; i++) {
    isSmall = !!randomInt(0, 1);
    type = isSmall ? 'asteroidSmall' : 'asteroidMed'
    x = randomInt(500, 1000)
    y = randomInt(500, 1000)
    a = this.asteroids.create(x, y, type)
    a.name = 'a' + i
    a.body.velocity.x = 5
    a.body.velocity.y = -5
    a.body.bounce.setTo(1, 1)
  }
}

GameLoop.prototype.createSlimeGang = function createSlimeGang() {
  this.slimes = this.game.add.group()
  this.slimes.enableBody = true
  this.slimes.physicsBodyType = Phaser.Physics.ARCADE
  var slime
  var x
  var y

  for (i = 0; i < 20; i++) {
    x = this.game.world.randomX
    y = this.game.world.randomY
    slime = this.slimes.create(x, y, 'slime')
    slime.name = 'slime' + i
    slime.body.bounce.setTo(1, 1)
    slime.animations.add('move')
    slime.animations.play('move', 8, true)
    slime.body.collideWorldBounds = true
  }
}

GameLoop.prototype.restartGame = function restartGame() {
  var self = this
  this.game.camera.reset()
  this.game.add.sprite(0, 0, 'gameOver')
  var enter = this.game.input.keyboard.addKey(Phaser.Keyboard.J)
  enter.onDown.addOnce(function () {
    self.game.state.start('mainMenu')
  })
}

module.exports = GameLoop

},{}],4:[function(require,module,exports){
function MainMenu(game) {
  this.game = game
}

MainMenu.prototype.create = function create() {
  this.music = {}
  this.music.intro = this.game.add.audio('intro')
  this.music.intro.loopFull(0.1)
  this.game.add.sprite(0, 0, 'title')
  this.enter = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER)
  this.enter.onDown.addOnce(this.startGame, this)
}

MainMenu.prototype.startGame = function startGame() {
  this.game.state.start('gameLoop')
  this.music.intro.stop()
}


module.exports = MainMenu

},{}]},{},[1]);
