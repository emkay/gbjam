function MainMenu(game) {
  this.game = game
}

MainMenu.prototype.create = function create() {
  var title = this.game.add.sprite(0, 0, 'title', 6)
  this.music = {}
  this.music.intro = this.game.add.audio('intro')
  this.music.intro.loopFull(0.1)
  this.enter = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER)
  this.enter.onDown.addOnce(this.startGame, this)
  title.animations.add('go')
  title.animations.play('go', 6, true)
}

MainMenu.prototype.startGame = function startGame() {
  this.game.state.start('gameLoop')
  this.music.intro.stop()
}


module.exports = MainMenu
