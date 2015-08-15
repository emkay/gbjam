function MainMenu(game) {
  this.game = game
}

MainMenu.prototype.create = function create() {
  // add sprite
  this.game.add.sprite(0, 0, 'title')
  this.enter = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER)
  this.enter.onDown.addOnce(this.startGame, this)
}

MainMenu.prototype.startGame = function startGame() {
  this.game.state.start('gameLoop')
}

module.exports = MainMenu
