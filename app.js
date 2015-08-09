var game = new Phaser.Game(160, 144, Phaser.AUTO, '', {
  preload: preload,
  create: create,
  update: update
}, false, false)

var player
var asteroid
var cursors
var fireButton
var starsDim
var starsBright
var bullet
var bullets
var bulletTime = 0

function isAlive(player) {
  return player.alive
}

function preload() {
  game.load.image('space', 'assets/space.png')
  game.load.image('starsDim', 'assets/space_stars_dim.png')
  game.load.image('starsBright', 'assets/space_stars_bright.png')
  game.load.image('bullet', 'assets/bullet.png')
  game.load.image('ship', 'assets/ship.png')
  game.load.image('asteroidSmall', 'assets/asteroid_small.png')
  game.load.image('asteroidMed', 'assets/asteroid_medium.png')
}

function create() {
  game.world.setBounds(0, 0, 1920, 1200)
  game.renderer.clearBeforeRender = false
  game.renderer.roundPixels = true

  game.physics.startSystem(Phaser.Physics.ARCADE)

  game.add.tileSprite(0, 0, 1920, 1200, 'space')
  starsDim = game.add.tileSprite(0, 0, 1920, 1200, 'starsDim')
  starsBright = game.add.tileSprite(0, 0, 1920, 1200, 'starsBright')

  bullets = game.add.group()
  bullets.enableBody = true
  bullets.physicsBodyType = Phaser.Physics.ARCADE
  bullets.createMultiple(40, 'bullet')
  bullets.setAll('anchor.x', 0.5)
  bullets.setAll('anchor.y', 0.5)

  player = game.add.sprite(75, 75, 'ship')
  player.anchor.set(0.5, 0.5)

  asteroid = game.add.sprite(100, 100, 'asteroidSmall')

  game.physics.enable(player, Phaser.Physics.ARCADE)
  game.physics.enable(asteroid, Phaser.Physics.ARCADE)

  player.body.collideWorldBounds = true
  player.body.immovable = true

  asteroid.body.collideWorldBounds = true
  asteroid.body.bounce.setTo(1, 1)
  asteroid.body.velocity.x = 25
  asteroid.body.velocity.y = -25

  player.body.drag.set(100)
  player.body.maxVelocity.set(200)
  cursors = game.input.keyboard.createCursorKeys()
  fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
  game.camera.follow(player)
}

function update() {
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

  game.world.wrap(player, 0, true)

  // collision stuff
  game.physics.arcade.collide(player, asteroid)
  game.physics.arcade.collide(bullet, asteroid)
}
