var work = require('webworkify')
var w = work(require('./worker.js'))

w.addEventListener('message', function (ev) {
  var data = ev.data
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
  state.asteroids = game.add.group()
  state.asteroids.enableBody = true
  state.asteroids.physicsBodyType = Phaser.Physics.ARCADE

  for (var i = 0; i < 40; i++) {
    var x = randomInt(500, 1000)
    var y = randomInt(500, 1000)
    var a = state.asteroids.create(x, y, 'asteroidSmall')
    a.name = 'a' + i
    a.body.velocity.x = 5
    a.body.velocity.y = -5
  }
}

function preload() {
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

  state.slime = game.add.sprite(randomInt(0, 100), randomInt(0, 100), 'slime')
  state.slime.animations.add('move')
  state.slime.animations.play('move', 8, true)

  state.bullets = game.add.group()
  state.bullets.enableBody = true
  state.bullets.physicsBodyType = Phaser.Physics.ARCADE
  state.bullets.createMultiple(40, 'bullet')
  state.bullets.setAll('anchor.x', 0.5)
  state.bullets.setAll('anchor.y', 0.5)
  state.bullet = null
  state.bulletTime = 0

  createAsteroidField()

  state.player = game.add.sprite(75, 75, 'ship')
  state.player.anchor.set(0.5, 0.5)

  game.physics.enable(state.player, Phaser.Physics.ARCADE)
  game.physics.enable(state.slime, Phaser.Physics.ARCADE)

  state.player.body.collideWorldBounds = true

  state.slime.body.collideWorldBounds = true
  state.slime.body.bounce.setTo(1, 1)

  state.player.body.drag.set(100)
  state.player.body.maxVelocity.set(100)
  state.cursors = game.input.keyboard.createCursorKeys()
  state.fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
  game.camera.follow(state.player)

  //console.log(state.slime.x, state.slime.y)
  w.postMessage({
    ax: state.slime.x,
    ay: state.slime.y,
    bx: state.player.x,
    by: state.player.y
  })
}

function update() {
  var player = state.player
  var slime = state.slime
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
    console.log(thing1.key, 'hit', thing2.key)
  }

  game.physics.arcade.collide(state.asteroids, state.asteroids, collideHandler)
  game.physics.arcade.collide(state.player, state.asteroids, collideHandler)
  game.physics.arcade.collide(state.bullet, state.asteroids, collideHandler)
  game.physics.arcade.collide(slime, state.asteroids, collideHandler)

  game.physics.arcade.collide(state.bullet, slime, collideHandler)
  game.physics.arcade.collide(player, slime, collideHandler)
}
