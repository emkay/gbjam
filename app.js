var boot = require('./lib/boot')
//var preloader = require('./lib/preloader')
//var mainMenu = require('./lib/main-menu')
var gameLoop = require('./lib/game')

var screenX = 160
var screenY = 144

var game = new Phaser.Game(160, 144, Phaser.AUTO)

game.state.add('boot', boot)
//game.state.add('preloader', preloader)
//game.state.add('mainMenu', mainMenu)
game.state.add('gameLoop', gameLoop)

game.state.start('boot')
