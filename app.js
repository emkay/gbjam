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
  player.anchor.setTo(0.5, 0.5)
  game.physics.enable(player, Phaser.Physics.ARCADE)
  cursors = game.input.keyboard.createCursorKeys()
  fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
}

function update() {
  if (player.alive) {
    player.body.velocity.setTo(0, 0)
    if (cursors.left.isDown) {
      player.body.velocity.x = -200
    } else if (cursors.right.isDown) {
      player.body.velocity.x = 200
    } else if (cursors.up.isDown) {
      player.body.velocity.y = -200
    } else if (cursors.down.isDown) {
      player.body.velocity.y = 200
    }
  }

  if (fireButton.isDown) {
    console.log('fire')
    // firebullet()
  }

  // collision stuff
}
