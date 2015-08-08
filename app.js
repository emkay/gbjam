var game = new Phaser.Game(160, 144, Phaser.AUTO, 'Super Space Prime', { 
  preload: preload,
  create: create,
  update: update
})

var player
var cursors
var fireButton
var bullet
var bullets
var bulletTime = 0

function preload() {
  game.load.image('bg', 'bg.png')
  game.load.image('bullet', 'bullet.png')
  game.load.image('ship', 'ship.png')
}

function create() {
  game.renderer.clearBeforeRender = false
  game.renderer.roundPixels = true

  game.renderer.clearBeforeRender = false
  game.renderer.roundPixels = true

  game.physics.startSystem(Phaser.Physics.ARCADE)

  game.add.tileSprite(0, 0, game.width, game.height, 'bg')

  bullets = game.add.group()
  bullets.enableBody = true
  bullets.physicsBodyType = Phaser.Physics.ARCADE
  bullets.createMultiple(40, 'bullet')
  bullets.setAll('anchor.x', 0.5)
  bullets.setAll('anchor.y', 0.5)


  player = game.add.sprite(75, 75, 'ship')
  player.anchor.set(0.5, 0.5)

  game.physics.enable(player, Phaser.Physics.ARCADE)

  player.body.drag.set(100)
  player.body.maxVelocity.set(200)
  cursors = game.input.keyboard.createCursorKeys()
  fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
}

function update() {
  if (player.alive) {
    if (cursors.up.isDown) {
      game.physics.arcade.accelerationFromRotation(player.rotation, 200, player.body.acceleration);
    } else {
      player.body.acceleration.set(0);
    }

    if (cursors.left.isDown) {
      player.body.angularVelocity = -300;
    } else if (cursors.right.isDown) {
      player.body.angularVelocity = 300;
    } else {
      player.body.angularVelocity = 0;
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

  // collision stuff
}
