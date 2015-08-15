function Boot(game) {
  this.game = game
}

Boot.prototype.preload = function preload() {
  this.game.load.audio('intro', 'assets/intro.mp3')
  this.game.load.audio('spaceMusic', 'assets/space.mp3')
  this.game.load.image('title', 'assets/title-screen.png')
  this.game.load.image('gameOver', 'assets/game-over.png')
  this.game.load.image('space', 'assets/space.png')
  this.game.load.image('starsDim', 'assets/space_stars_dim.png')
  this.game.load.image('starsBright', 'assets/space_stars_bright.png')
  this.game.load.image('bullet', 'assets/bullet.png')
  this.game.load.image('missle', 'assets/missle.png')
  this.game.load.image('ship', 'assets/ship.png')
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
