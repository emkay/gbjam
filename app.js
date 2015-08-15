var boot = require('./lib/boot')
var mainMenu = require('./lib/main-menu')
var gameLoop = require('./lib/game-loop')

var screenX = 160
var screenY = 144

var game = new Phaser.Game(screenX, screenY, Phaser.CANVAS)

game.state.add('boot', boot)
game.state.add('mainMenu', mainMenu)
game.state.add('gameLoop', gameLoop)

game.state.start('boot')
