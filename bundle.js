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
  this.game.load.audio('spaceMusic', 'assets/space.mp3')
  this.game.load.audio('explode', 'assets/explode.mp3')
  this.game.load.audio('blaster', 'assets/blaster.mp3')
  this.game.load.image('title', 'assets/title-screen.png')
  this.game.load.image('gameOver', 'assets/game-over.png')
  this.game.load.image('space', 'assets/space.png')
  this.game.load.image('starsDim', 'assets/space_stars_dim.png')
  this.game.load.image('starsBright', 'assets/space_stars_bright.png')
  this.game.load.image('bullet', 'assets/bullet.png')
  this.game.load.image('missle', 'assets/missle.png')
  this.game.load.image('ship', 'assets/ship.png')
  this.game.load.image('wall', 'assets/circuit_wall.png')
  this.game.load.image('wallH', 'assets/circuit_wall_horizontal.png')
  this.game.load.image('door', 'assets/circuit_door.png')
  this.game.load.image('asteroidSmall', 'assets/asteroid_small.png')
  this.game.load.image('asteroidMed', 'assets/asteroid_medium.png')
  this.game.load.spritesheet('slime', 'assets/space-slime.png', 10, 12)
  this.game.load.spritesheet('explosion', 'assets/explosion.png', 16, 16)
  this.game.load.spritesheet('m2zak', 'assets/m2zak.png', 16, 20)
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
  this.worldSize = {width: 1920, height: 1200}
}

function isEven(n) {
  return n % 2 === 0
}

GameLoop.prototype.create = function create() {
  var self = this
  var worldWidth = this.worldSize.width
  var worldHeight = this.worldSize.height

  console.log(worldWidth, worldHeight)
  this.counter = 0
  this.sound = {}
  this.sound.explode = this.game.add.audio('explode')
  this.sound.blaster = this.game.add.audio('blaster')

  this.music = {}
  this.music.space = this.game.add.audio('spaceMusic')
  this.music.space.loopFull(0.1)

  this.space = this.game.add.tileSprite(0, 0, worldWidth, worldHeight, 'space')
  this.starsDim = this.game.add.tileSprite(0, 0, worldWidth, worldHeight, 'starsDim')
  this.starsBright = this.game.add.tileSprite(0, 0, worldWidth, worldHeight, 'starsBright')

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

  this.missles = this.game.add.group()
  this.missles.enableBody = true
  this.missles.physicsBodyType = Phaser.Physics.ARCADE
  this.missles.createMultiple(5, 'missle')
  this.missles.setAll('anchor.x', 0.5)
  this.missles.setAll('anchor.y', 0.5)
  this.missle = null
  this.missleTime = 0

  this.createAsteroidField()
  this.createSlimeGang()
  this.createWalls()
 
  this.player = this.game.add.sprite(75, 75, 'ship')
  this.player.anchor.set(0.5, 0.5)
  this.player.health = 20
  this.player.damage = damage

  this.m2zak = this.game.add.sprite(this.game.world.randomX, this.game.world.randomY, 'm2zak')

  this.physics.enable(this.player, Phaser.Physics.ARCADE)
  this.physics.enable(this.m2zak, Phaser.Physics.ARCADE)
  this.physics.enable(this.walls, Phaser.Physics.ARCADE)

  this.player.hasMissle = false
  this.player.body.collideWorldBounds = true

  this.player.body.drag.set(25)
  this.player.body.maxVelocity.set(100)
  this.cursors = this.game.input.keyboard.addKeys({'up': Phaser.Keyboard.W, 'down': Phaser.Keyboard.S, 'left': Phaser.Keyboard.A, 'right': Phaser.Keyboard.D})
  this.fireButton = this.game.input.keyboard.addKey(Phaser.Keyboard.J)
  this.missleButton = this.game.input.keyboard.addKey(Phaser.Keyboard.K)
  this.camera.follow(this.player)

  this.m2zak.body.immovable = true
  this.m2zak.health = 10
  this.m2zak.damage = damage
  this.m2zak.anchor.set(0.5, 0.5)
  this.m2zak.body.collideWorldBounds = true

  //state.m2zak.animations.add('thrusters')
  //state.m2zak.animations.play('thrusters')
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function damage(thing, killFn) {
  if (!thing.pauseDamage) {
    thing.pauseDamage = true
    thing.health -= 1
  }
  setTimeout(function () {
    thing.pauseDamage = false
  }, 300)
  if (thing.health <= 0) {
    thing.kill()
    killFn()
    return true
  }

  return false
}

GameLoop.prototype.update = function update() {
  var self = this

  this.counter += 1

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
        this.sound.blaster.play()
        this.bullet.reset(this.player.body.x + 10, this.player.body.y + 10)
        this.bullet.lifespan = 1000
        this.bullet.rotation = this.player.rotation
        this.physics.arcade.velocityFromRotation(this.player.rotation, 400, this.bullet.body.velocity)
        this.bulletTime = this.time.now + 400
      }
    }
  }

  var missleN = 10
  if (this.player.hasMissle && this.missleButton.isDown) {
    if (this.time.now > this.missleTime) {
      this.missles.forEach(function (missle) {
        missle.reset(self.player.body.x + randomInt(1, missleN), self.player.body.y + randomInt(1, missleN))
        missle.lifespan = 1000
        missle.rotation = self.player.rotation
        self.physics.arcade.velocityFromRotation(self.player.rotation, 200, missle.body.velocity)
        self.missleTime = self.time.now + 400
        missleN += 2
      })
    }
  }


  // move stuff

  //this.m2zak.body.x += randomInt(0, 1)
  //this.m2zak.body.y += randomInt(0, 1)
  //this.m2zak.rotation += 0.0025

  var worldPosX = this.m2zak.worldPosition.x
  var worldPosY = this.m2zak.worldPosition.y
  var isNearX = (worldPosX < 300) && (worldPosX > -300)
  var isNearY = (worldPosY < 300) && (worldPosY > -300)
  var gx
  var gy

  var shouldHunt = this.m2zak.alive && !this.m2zak.isMoving && this.counter > 5000
  if (shouldHunt) {
    this.game.physics.arcade.moveToObject(this.m2zak, this.player, 100)
    this.m2zak.isMoving = true
    console.log('I WILL FIND YOU')
    setTimeout(function () {
        self.m2zak.isMoving = false
    }, 5000)
  }

  if (!this.m2zak.isMoving) {
    if (!isNearX || !isNearY) {
      console.log('m2zak moving')
      this.m2zak.isMoving = true
      gx = this.game.world.randomX
      gy = this.game.world.randomY
      console.log(gx, gy)
      this.game.physics.arcade.moveToXY(this.m2zak, gx, gy, 30)
      setTimeout(function () {
        self.m2zak.isMoving = false
        console.log('stop moving')
      }, 10000)
    } else {
      // attack?
    }
  }

  this.game.world.wrap(this.player, 0, true)

  // collision stuff
  function ch(thing1, thing2) {
    var explosion

    if (thing1.key === 'bullet' || thing1.key === 'missle') {
      thing1.reset(0,0)

      if (typeof thing2.damage === 'function') {
        if (thing2.key === 'door') {
          if (thing1.key === 'missle') {
            thing2.damage(thing2, function () {
              console.log(thing2.key, 'killed')
              explosion = self.explosions.getFirstExists(false)
              explosion.reset(thing2.body.x, thing2.body.y)
              explosion.play('boom', 8, false, true)
              self.sound.explode.play()
            })
            return;
          } else {
            return;
          }
        }

        thing2.damage(thing2, function () {
          console.log(thing2.key, 'killed')
          explosion = self.explosions.getFirstExists(false)
          explosion.reset(thing2.body.x, thing2.body.y)
          explosion.play('boom', 8, false, true)
          self.sound.explode.play()
          if (thing2.key === 'm2zak') {
            self.player.hasMissle = true
            console.log('YOU GOT MISSLES!')
          }
        })
      }
    }

    if (thing1.key === 'ship' && thing2.key !== 'wall' && thing2.key !== 'door') {
      console.log(thing1.key, thing2.key)
      thing1.damage(thing1, function () {
        console.log(thing1.key, 'killed')
        explosion = self.explosions.getFirstExists(false)
        explosion.reset(thing1.body.x, thing1.body.y)
        explosion.play('boom', 8, false, true)
      })
    }
  }

  this.game.physics.arcade.collide(this.player, this.walls, ch)
  this.game.physics.arcade.collide(this.slimes, this.walls, ch)
  this.game.physics.arcade.collide(this.asteroids, this.walls, ch)
  this.game.physics.arcade.collide(this.bullet, this.walls, ch)
  this.game.physics.arcade.collide(this.missles, this.walls, ch)

  this.game.physics.arcade.collide(this.asteroids, this.asteroids, ch)
  this.game.physics.arcade.collide(this.missles, this.asteroids, ch)
  this.game.physics.arcade.collide(this.missles, this.slimes, ch)
  this.game.physics.arcade.collide(this.missles, this.m2zak, ch)

  this.game.physics.arcade.collide(this.bullet, this.m2zak, ch)
  this.game.physics.arcade.collide(this.player, this.asteroids, ch)
  this.game.physics.arcade.collide(this.player, this.m2zak, ch)
  this.game.physics.arcade.collide(this.bullet, this.asteroids, ch)
  this.game.physics.arcade.collide(this.slimes, this.asteroids, ch)

  this.game.physics.arcade.collide(this.bullet, this.slimes, ch)
  this.game.physics.arcade.collide(this.player, this.slimes, ch)
}

GameLoop.prototype.createWalls = function createWalls() {
  var self = this
  self.walls = this.game.add.group()
  self.walls.enableBody = true
  self.walls.physicsBodyType = Phaser.Physics.ARCADE
  function verticleWall(x, y) {
    var wall = self.walls.create(x, y, 'wall')
    wall.body.immovable = true
  }

  function horizontalWall(x, y) {
    var wall = self.walls.create(x, y, 'wallH')
    wall.body.immovable = true
    wall.key = 'wall'
  }

  var door = self.walls.create(100, 85, 'door')
  door.body.immovable = true
  door.health = 5
  door.damage = damage
  verticleWall(100, 21)
  verticleWall(100, 117)
  horizontalWall(115, 20)
  horizontalWall(115, 166)
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
    a.health = 1
    a.damage = damage
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
    slime.health = 1
    slime.damage = damage
    slime.body.bounce.setTo(1, 1)
    slime.animations.add('move')
    slime.animations.play('move', 8, true)
    slime.body.collideWorldBounds = true
  }
}

GameLoop.prototype.restartGame = function restartGame() {
  var self = this
  this.music.space.stop()
  this.game.camera.reset()
  this.game.add.sprite(0, 0, 'gameOver')
  var aButton = this.game.input.keyboard.addKey(Phaser.Keyboard.J)
  var bButton = this.game.input.keyboard.addKey(Phaser.Keyboard.K)

  aButton.onDown.addOnce(function () {
    self.game.state.start('mainMenu')
  })

  bButton.onDown.addOnce(function () {
    self.game.state.start('gameLoop')
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
