function GameLoop(game) {
  this.game = game
}

GameLoop.prototype.create = function create() {
  var self = this

  this.music = {}
  this.music.space = this.game.add.audio('spaceMusic')
  this.music.space.loopFull(0.1)

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

  this.missles= this.game.add.group()
  this.missles.enableBody = true
  this.missles.physicsBodyType = Phaser.Physics.ARCADE
  this.missles.createMultiple(40, 'missle')
  this.missles.setAll('anchor.x', 0.5)
  this.missles.setAll('anchor.y', 0.5)
  this.missle = null
  this.missleTime = 0

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
  this.missleButton = this.game.input.keyboard.addKey(Phaser.Keyboard.K)
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
        this.bullet.rotation = this.player.rotation
        this.physics.arcade.velocityFromRotation(this.player.rotation, 400, this.bullet.body.velocity)
        this.bulletTime = this.time.now + 400
      }
    }
  }

  if (this.missleButton.isDown) {
    if (this.time.now > this.missleTime) {
      this.missle = this.missles.getFirstExists(false)

      if (this.missle) {
        this.missle.reset(this.player.body.x + 10, this.player.body.y + 10)
        this.missle.lifespan = 1000
        this.missle.rotation = this.player.rotation
        this.physics.arcade.velocityFromRotation(this.player.rotation, 400, this.missle.body.velocity)
        this.missleTime = this.time.now + 400
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
