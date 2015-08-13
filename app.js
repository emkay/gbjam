var work = require('webworkify')
var w = work(require('./worker.js'))

w.addEventListener('message', function (ev) {
  var data = ev.data
  state.movements = data
})

var game = new Phaser.Game(160, 144, Phaser.AUTO, '', {
  preload: preload,
  create: create,
  update: update
}, false, false)

var state = {}

function isAlive(player) {
  return player.alive
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function createAsteroidField() {
  var isSmall
  var type
  var x
  var y
  var a
  var i
  state.asteroids = game.add.group()
  state.asteroids.enableBody = true
  state.asteroids.physicsBodyType = Phaser.Physics.ARCADE

  for (i = 0; i < 40; i++) {
    isSmall = !!randomInt(0, 1);
    type = isSmall ? 'asteroidSmall' : 'asteroidMed'
    x = randomInt(500, 1000)
    y = randomInt(500, 1000)
    a = state.asteroids.create(x, y, type)
    a.name = 'a' + i
    a.body.velocity.x = 5
    a.body.velocity.y = -5
    a.body.bounce.setTo(1, 1)
  }
}

function createSlimeGang() {
  state.slimes= game.add.group()
  state.slimes.enableBody = true
  state.slimes.physicsBodyType = Phaser.Physics.ARCADE
  var slime
  var x
  var y

  for (i = 0; i < 20; i++) {
    x = game.world.randomX
    y = game.world.randomY
    slime = state.slimes.create(x, y, 'slime')
    slime.name = 'slime' + i
    slime.body.bounce.setTo(1, 1)
    slime.animations.add('move')
    slime.animations.play('move', 8, true)
    slime.body.collideWorldBounds = true
  }
}

function preload(game) {
  game.load.image('space', 'assets/space.png')
  game.load.image('starsDim', 'assets/space_stars_dim.png')
  game.load.image('starsBright', 'assets/space_stars_bright.png')
  game.load.image('bullet', 'assets/bullet.png')
  game.load.image('ship', 'assets/ship.png')
  game.load.image('asteroidSmall', 'assets/asteroid_small.png')
  game.load.image('asteroidMed', 'assets/asteroid_medium.png')
  game.load.spritesheet('slime', 'assets/space-slime.png', 10, 12)
  game.load.spritesheet('explosion', 'assets/explosion.png', 16, 16)
}

function create() {
  game.world.setBounds(0, 0, 1920, 1200)
  game.renderer.clearBeforeRender = false
  game.renderer.roundPixels = true

  game.physics.startSystem(Phaser.Physics.ARCADE)

  game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE
  game.scale.setUserScale(3, 3)

  game.add.tileSprite(0, 0, 1920, 1200, 'space')
  state.starsDim = game.add.tileSprite(0, 0, 1920, 1200, 'starsDim')
  state.starsBright = game.add.tileSprite(0, 0, 1920, 1200, 'starsBright')

  state.explosions = game.add.group()
  state.explosions.createMultiple(30, 'explosion')
  state.explosions.forEach(function (explosion) {
    explosion.anchor.x = 0.5
    explosion.anchor.y = 0.5
    explosion.animations.add('boom')
  }, this)
 
  state.bullets = game.add.group()
  state.bullets.enableBody = true
  state.bullets.physicsBodyType = Phaser.Physics.ARCADE
  state.bullets.createMultiple(40, 'bullet')
  state.bullets.setAll('anchor.x', 0.5)
  state.bullets.setAll('anchor.y', 0.5)
  state.bullet = null
  state.bulletTime = 0

  createAsteroidField()
  createSlimeGang()

  state.player = game.add.sprite(75, 75, 'ship')
  state.player.anchor.set(0.5, 0.5)
  state.player.health = 20
  state.player.damage = function damage() {
    state.player.health -= 1
    if (state.player.health <= 0) {
      state.player.kill()
      return true
    }

    return false
  }

  game.physics.enable(state.player, Phaser.Physics.ARCADE)

  state.player.body.collideWorldBounds = true

  state.player.body.drag.set(100)
  state.player.body.maxVelocity.set(100)
  state.cursors = game.input.keyboard.createCursorKeys()
  state.fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
  game.camera.follow(state.player)
}

function update() {
  var player = state.player
  var cursors = state.cursors
  var fireButton = state.fireButton

  if (isAlive(player)) {
    if (cursors.up.isDown) {
      game.physics.arcade.accelerationFromRotation(player.rotation, 80, player.body.acceleration)
    } else {
      player.body.acceleration.set(0)
    }
    
    if (cursors.left.isDown) {
      player.body.angularVelocity = -300
    } else if (cursors.right.isDown) {
      player.body.angularVelocity = 300
    } else {
      player.body.angularVelocity = 0
    }
  }

  if (fireButton.isDown) {
    if (game.time.now > state.bulletTime) {
      state.bullet = state.bullets.getFirstExists(false)

      if (state.bullet) {
        state.bullet.reset(player.body.x + 10, player.body.y + 10)
        state.bullet.lifespan = 1000
        state.bullet.rotation = player.rotation
        game.physics.arcade.velocityFromRotation(player.rotation, 400, state.bullet.body.velocity)
        state.bulletTime = game.time.now + 400
      }
    }
  }

  // move stuff

  //state.slime.body.x += randomInt(-1, 1)
  //state.slime.body.y += randomInt(-1, 1)

  game.world.wrap(player, 0, true)

  // collision stuff
  function collideHandler(thing1, thing2) {
    var explosion

    if (thing1.key === 'bullet') {
      thing2.kill()
      explosion = state.explosions.getFirstExists(false)
      explosion.reset(thing2.body.x, thing2.body.y)
      explosion.play('boom', 8, false, true)
    }

    if (thing1.key === 'ship') {
      thing1.damage()
    }
  }

  game.physics.arcade.collide(state.asteroids, state.asteroids, collideHandler)
  game.physics.arcade.collide(state.player, state.asteroids, collideHandler)
  game.physics.arcade.collide(state.bullet, state.asteroids, collideHandler)
  game.physics.arcade.collide(state.slimes, state.asteroids, collideHandler)

  game.physics.arcade.collide(state.bullet, state.slimes, collideHandler)
  game.physics.arcade.collide(state.player, state.slimes, collideHandler)
}
