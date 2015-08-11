var PF = require('pathfinding')

var game = new Phaser.Game(160, 144, Phaser.AUTO, '', {
  preload: preload,
  create: create,
  update: update
}, false, false)

var state = {}

var grid = new PF.Grid(1920, 1200)
var finder = new PF.AStarFinder({
  allowDiagonal: true
});

function mobMove() {
  var gridB = grid.clone()
  var ax = state.slime.x | 0
  var ay = state.slime.y | 0
  var bx = state.player.x | 0
  var by = state.player.y | 0
  var movements = finder.findPath(ax, ay, bx, by, gridB)
  return movements
}

function isAlive(player) {
  return player.alive
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
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

  state.slime = game.add.sprite(randomInt(0, 1920), randomInt(0, 1200), 'slime')
  state.slime.animations.add('move')
  state.slime.animations.play('move', 8, true)

  state.bullets = game.add.group()
  state.bullets.enableBody = true
  state.bullets.physicsBodyType = Phaser.Physics.ARCADE
  state.bullets.createMultiple(40, 'bullet')
  state.bullets.setAll('anchor.x', 0.5)
  state.bullets.setAll('anchor.y', 0.5)

  state.player = game.add.sprite(75, 75, 'ship')
  state.player.anchor.set(0.5, 0.5)

  state.asteroid = game.add.sprite(100, 100, 'asteroidSmall')

  game.physics.enable(state.player, Phaser.Physics.ARCADE)
  game.physics.enable(state.asteroid, Phaser.Physics.ARCADE)
  game.physics.enable(state.slime, Phaser.Physics.ARCADE)

  state.player.body.collideWorldBounds = true

  state.slime.body.collideWorldBounds = true
  state.slime.body.bounce.setTo(1, 1)

  state.asteroid.body.collideWorldBounds = true
  state.asteroid.body.bounce.setTo(1, 1)
  state.asteroid.body.velocity.x = 25
  state.asteroid.body.velocity.y = -25

  state.player.body.drag.set(100)
  state.player.body.maxVelocity.set(200)
  state.cursors = game.input.keyboard.createCursorKeys()
  state.fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
  game.camera.follow(state.player)

  state.movements = mobMove()
}

function update() {
  var asteroid = state.asteroid
  var player = state.player
  var slime = state.slime
  var cursors = state.cursors
  var fireButton = state.fireButton
  var bullets = state.bullets
  var bulletTime = state.bulletTime
  var bullet

  if (isAlive(player)) {
    if (cursors.up.isDown) {
      game.physics.arcade.accelerationFromRotation(player.rotation, 200, player.body.acceleration)
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
    if (game.time.now > bulletTime) {
      bullet = bullets.getFirstExists(false)

      if (bullet) {
        bullet.reset(player.body.x + 10, player.body.y + 10)
        bullet.lifespan = 1000
        bullet.rotation = player.rotation
        game.physics.arcade.velocityFromRotation(player.rotation, 400, bullet.body.velocity)
        bulletTime = game.time.now + 200
      }
    }
  }

  var move

  if (state.movements.length > 0) {
    move = state.movements.shift()
    slime.x = move[0]
    slime.y = move[1]
  } else {
    //mobMove()
  }

  game.world.wrap(player, 0, true)

  function collideHandler(thing1, thing2) {
    console.log(thing1.key, 'hit', thing2.key)
  }
  // collision stuff
  game.physics.arcade.collide(player, asteroid, collideHandler)
  game.physics.arcade.collide(bullet, asteroid, collideHandler)
  game.physics.arcade.collide(bullet, slime, collideHandler)
  game.physics.arcade.collide(slime, asteroid, collideHandler)
  game.physics.arcade.collide(player, slime, collideHandler)
}
