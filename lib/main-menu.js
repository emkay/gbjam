function MainMenu(game) {
  this.game = game
}

MainMenu.prototype.create = function create() {
  this.music = {}
  this.music.intro = this.game.add.audio('intro')
  this.music.intro.loopFull(0.1)
  this.game.add.sprite(0, 0, 'title')
  this.enter = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER)
  this.enter.onDown.addOnce(this.startGame, this)
}

MainMenu.prototype.startGame = function startGame() {
  this.game.state.start('gameLoop')
  this.music.intro.stop()
}


module.exports = MainMenu
