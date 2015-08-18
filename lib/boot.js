function Boot(game) {
  this.game = game
}

Boot.prototype.preload = function preload() {
  this.game.load.audio('intro', 'assets/intro.mp3')
  this.game.load.audio('spaceMusic', 'assets/space.mp3')
  this.game.load.audio('explode', 'assets/explode.mp3')
  this.game.load.audio('shipHit', 'assets/ship-hit.mp3')
  this.game.load.audio('blaster', 'assets/blaster.mp3')
  this.game.load.audio('bossMusic', 'assets/boss.mp3')
  this.game.load.image('gameOver', 'assets/game-over.png')
  this.game.load.image('space', 'assets/space.png')
  this.game.load.image('starsDim', 'assets/space_stars_dim.png')
  this.game.load.image('starsBright', 'assets/space_stars_bright.png')
  this.game.load.image('bullet', 'assets/bullet.png')
  this.game.load.image('missle', 'assets/missle.png')
  this.game.load.image('m2zakMissle', 'assets/m2zak_missle.png')
  this.game.load.image('ship', 'assets/ship.png')
  this.game.load.image('wall', 'assets/circuit_wall.png')
  this.game.load.image('wallH', 'assets/circuit_wall_horizontal.png')
  this.game.load.image('asteroidSmall', 'assets/asteroid_small.png')
  this.game.load.image('asteroidMed', 'assets/asteroid_medium.png')
  this.game.load.image('winScreen', 'assets/win_screen.png')
  this.game.load.atlasJSONHash('slime', 'assets/space-slime.png', 'assets/space-slime.json')
  this.game.load.atlasJSONHash('explosion', 'assets/explosion.png', 'assets/explosion.json')
  this.game.load.atlasJSONHash('m2zak', 'assets/m2zak.png', 'assets/m2zak.json')
  this.game.load.atlasJSONHash('title', 'assets/title-screen-ani.png', 'assets/title-screen-ani.json')
  this.game.load.atlasJSONHash('door', 'assets/door.png', 'assets/door.json')
  this.game.load.atlasJSONHash('boss', 'assets/boss.png', 'assets/boss.json')
  this.game.load.atlasJSONHash('youGotMissles', 'assets/you-got-missles.png', 'assets/you-got-missles.json')
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
