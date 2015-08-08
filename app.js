// canvas is 2X the GB pixels

var game = new Phaser.Game(320, 288, Phaser.AUTO, 'Super Space Prime', { 
  preload: preload,
  create: create,
  update: update
})

var player
var cursors
var fireButton

function preload() {
  game.load.image('ship', 'triangle.png')
}

function create() {
  game.physics.startSystem(Phaser.Physics.ARCADE)
  player = game.add.sprite(100, 100, 'ship')
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
    console.log('fire')
    // firebullet()
  }

  // collision stuff
}
