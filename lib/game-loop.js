function GameLoop(game) {
  this.game = game
  this.worldSize = {width: 1920, height: 1200}
}

function isEven(n) {
  return n % 2 === 0
}

GameLoop.prototype.create = function create() {
  var self = this
  var worldWidth = this.worldSize.width
  var worldHeight = this.worldSize.height

  console.log(worldWidth, worldHeight)
  this.counter = 0
  this.sound = {}
  this.sound.explode = this.game.add.audio('explode')
  this.sound.blaster = this.game.add.audio('blaster')
  this.sound.shipHit = this.game.add.audio('shipHit')

  this.music = {}
  this.music.space = this.game.add.audio('spaceMusic')
  this.music.space.loopFull(0.1)

  this.music.boss = this.game.add.audio('bossMusic')

  this.space = this.game.add.tileSprite(0, 0, worldWidth, worldHeight, 'space')
  this.starsDim = this.game.add.tileSprite(0, 0, worldWidth, worldHeight, 'starsDim')
  this.starsBright = this.game.add.tileSprite(0, 0, worldWidth, worldHeight, 'starsBright')

  this.explosions = this.game.add.group()
  this.explosions.createMultiple(30, 'explosion')
  this.explosions.forEach(function (explosion) {
    explosion.anchor.x = 0.5
    explosion.anchor.y = 0.5
    explosion.animations.add('boom')
  })
 
  this.bullets = this.game.add.group()
  this.bullets.enableBody = true
  this.bullets.physicsBodyType = Phaser.Physics.ARCADE
  this.bullets.createMultiple(40, 'bullet')
  this.bullets.setAll('anchor.x', 0.5)
  this.bullets.setAll('anchor.y', 0.5)
  this.bullet = null
  this.bulletTime = 0

  this.missles = this.game.add.group()
  this.missles.enableBody = true
  this.missles.physicsBodyType = Phaser.Physics.ARCADE
  this.missles.createMultiple(5, 'missle')
  this.missles.setAll('anchor.x', 0.5)
  this.missles.setAll('anchor.y', 0.5)
  this.missle = null
  this.missleTime = 0

  this.m2zakMissles = this.game.add.group()
  this.m2zakMissles.enableBody = true
  this.m2zakMissles.physicsBodyType = Phaser.Physics.ARCADE
  this.m2zakMissles.createMultiple(5, 'm2zakMissle')
  this.m2zakMissles.setAll('anchor.x', 0.5)
  this.m2zakMissles.setAll('anchor.y', 0.5)
  this.m2zakMissle = null
  this.m2zakMissleTime = 0

  this.createAsteroidField()
  this.createSlimeGang()
  this.createWalls()
 
  this.player = this.game.add.sprite(75, 75, 'ship')
  this.player.anchor.set(0.5, 0.5)
  this.player.health = 20

  this.m2zak = this.game.add.sprite(this.game.world.randomX, this.game.world.randomY, 'm2zak')

  this.boss = this.game.add.sprite(1500, 590, 'boss')
  this.boss.animations.add('move')
  this.boss.isAttacking = false
  this.boss.countMoves = 0

  this.physics.enable(this.player, Phaser.Physics.ARCADE)
  this.physics.enable(this.m2zak, Phaser.Physics.ARCADE)
  this.physics.enable(this.walls, Phaser.Physics.ARCADE)
  this.physics.enable(this.boss, Phaser.Physics.ARCADE)

  this.player.hasMissle = false
  this.player.body.collideWorldBounds = true

  this.boss.body.immovable = true
  this.boss.health = 30
  this.boss.anchor.set(0.5, 0.5)

  this.player.body.drag.set(25)
  this.player.body.maxVelocity.set(100)
  this.cursors = this.game.input.keyboard.addKeys({'up': Phaser.Keyboard.W, 'down': Phaser.Keyboard.S, 'left': Phaser.Keyboard.A, 'right': Phaser.Keyboard.D})
  this.fireButton = this.game.input.keyboard.addKey(Phaser.Keyboard.J)
  this.missleButton = this.game.input.keyboard.addKey(Phaser.Keyboard.K)
  this.camera.follow(this.player)

  this.m2zak.body.immovable = true
  this.m2zak.health = 10
  this.m2zak.anchor.set(0.5, 0.5)
  //this.m2zak.body.collideWorldBounds = true

  this.m2zak.animations.add('thrusters')
  this.m2zak.animations.play('thrusters', 10, true)
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

GameLoop.prototype.damage = function damage(thing, killFn) {
  console.log('damage ', thing.key)
  thing.health -= 1

  if (thing.key === 'ship') {
    this.sound.shipHit.play('', 0, 0.2)
  }

  if (thing.health <= 0) {
    thing.kill()
    killFn()
    return true
  }

  return false
}

GameLoop.prototype.update = function update() {
  var self = this
  var win

  if (!this.boss.alive) {
    // win screen
    this.game.camera.reset()
    this.music.space.stop()
    this.music.boss.stop()
    win = this.game.add.sprite(0, 0, 'winScreen')
  }

  this.counter += 1

  if (this.player.alive) {
    if (this.cursors.up.isDown) {
      this.game.physics.arcade.accelerationFromRotation(this.player.rotation, 80, this.player.body.acceleration)
    } else {
      this.player.body.acceleration.set(0)
    }
    
    if (this.cursors.left.isDown) {
      this.player.body.angularVelocity = -300
    } else if (this.cursors.right.isDown) {
      this.player.body.angularVelocity = 300
    } else {
      this.player.body.angularVelocity = 0
    }
  } else {
    self.restartGame()
  }

  if (this.fireButton.isDown) {
    if (this.time.now > this.bulletTime) {
      this.bullet = this.bullets.getFirstExists(false)

      if (this.bullet) {
        this.sound.blaster.play('', 0, 0.2)
        this.bullet.reset(this.player.body.x + 10, this.player.body.y + 10)
        this.bullet.lifespan = 1000
        this.bullet.rotation = this.player.rotation
        this.physics.arcade.velocityFromRotation(this.player.rotation, 400, this.bullet.body.velocity)
        this.bulletTime = this.time.now + 400
      }
    }
  }

  var missleN = 10
  if (this.player.hasMissle && this.missleButton.isDown) {
    if (this.time.now > this.missleTime) {
      this.missles.forEach(function (missle) {
        missle.reset(self.player.body.x + randomInt(1, missleN), self.player.body.y + randomInt(1, missleN))
        missle.lifespan = 1000
        missle.rotation = self.player.rotation
        self.physics.arcade.velocityFromRotation(self.player.rotation, 200, missle.body.velocity)
        self.missleTime = self.time.now + 400
        missleN += 2
      })
    }
  }


  // move stuff

  //this.m2zak.body.x += randomInt(0, 1)
  //this.m2zak.body.y += randomInt(0, 1)
  //this.m2zak.rotation += 0.0025

  var worldPosX = this.m2zak.worldPosition.x
  var worldPosY = this.m2zak.worldPosition.y
  var isNearX = (worldPosX < 300) && (worldPosX > -300)
  var isNearY = (worldPosY < 300) && (worldPosY > -300)
  var gx
  var gy

  var shouldHunt = this.m2zak.alive && !this.m2zak.isMoving && this.counter > 5000
  if (shouldHunt) {
    this.game.physics.arcade.moveToObject(this.m2zak, this.player, 100)
    this.m2zak.isMoving = true
    console.log('I WILL FIND YOU')

    setTimeout(function () {
      self.m2zak.isMoving = false
    }, 3000)
  }

  if (this.boss.alive && this.boss.isAttacking) {
    if (this.boss.countMoves < 50) {
      this.boss.body.velocity.x = 10
    } else {
      this.boss.body.velocity.x = -10
      this.boss.countMoves = 0
    }

    var bossSlime
    var bossSlimeYoffset = randomInt(0, 40)
    if ((this.boss.countMoves % 50) === 0) {
      bossSlime = this.bossSlimes.getFirstExists(false)
      if (bossSlime) {
        bossSlime.reset(this.boss.body.x, this.boss.body.y + bossSlimeYoffset)
        bossSlime.lifespan = 1000
        this.physics.arcade.velocityFromRotation(this.boss.rotation, -200, bossSlime.body.velocity)
      }
    }

    this.boss.countMoves += 1
  }

  var m2zakMissleN = 10
  if (this.m2zak.alive && this.time.now > this.m2zakMissleTime) {
    this.m2zakMissles.forEach(function (missle) {
      missle.reset(self.m2zak.body.x + randomInt(1, m2zakMissleN), self.m2zak.body.y + randomInt(1, m2zakMissleN))
      missle.lifespan = 1000
      missle.rotation = self.m2zak.rotation
      self.physics.arcade.velocityFromRotation(self.m2zak.rotation, -200, missle.body.velocity)
      self.m2zakMissleTime = self.time.now + 400
      m2zakMissleN += 2
    })
  }

  if (!this.m2zak.isMoving) {
    if (!isNearX || !isNearY) {
      console.log('m2zak moving')
      this.m2zak.isMoving = true
      gx = this.game.world.randomX
      gy = this.game.world.randomY
      console.log(gx, gy)
      this.game.physics.arcade.moveToXY(this.m2zak, gx, gy, 30)
      setTimeout(function () {
        self.m2zak.isMoving = false
        console.log('stop moving')
      }, 5000)
    }
  }

  this.game.world.wrap(this.player, 0, true)

  // collision stuff
  function ch(thing1, thing2) {
    var explosion

    if (thing1.key === 'bullet' || thing1.key === 'missle') {
      thing1.reset(0,0)

      if (thing2.key === 'door') {
        if (thing1.key === 'missle') {
          self.damage(thing2, function () {
            console.log(thing2.key, 'killed')
            explosion = self.explosions.getFirstExists(false)
            explosion.reset(thing2.body.x, thing2.body.y)
            explosion.play('boom', 12, false, true)
            self.sound.explode.play('', 0, 0.2)
          })
          self.boss.isAttacking = true
          self.music.space.stop()
          self.music.boss.loopFull(0.1)
          self.boss.animations.play('move', 10, true)
          return;
        } else {
          return;
        }
      }

      if (thing2.key === 'wall') {
        return;
      }

      self.damage(thing2, function () {
        var youGotMissles
        console.log(thing2.key, 'killed')
        explosion = self.explosions.getFirstExists(false)
        explosion.reset(thing2.body.x, thing2.body.y)
        explosion.play('boom', 12, false, true)
        self.sound.explode.play()
        if (thing2.key === 'm2zak') {
          var ox = self.game.camera.x
          var oy = self.game.camera.y
          self.player.hasMissle = true
          self.game.camera.reset()
          youGotMissles = self.game.add.sprite(0, 0, 'youGotMissles')
          var youGotMisslesAni = youGotMissles.animations.add('go')
          youGotMissles.animations.play('go', 15, false, true)
          youGotMisslesAni.onComplete.add(function () {
            self.game.camera.follow(self.player)
          })
          console.log('YOU GOT MISSLES!')
        }
      })
    }

    if (thing1.key === 'ship' && thing2.key !== 'wall' && thing2.key !== 'door') {
      console.log(thing1.key, thing2.key)
      self.damage(thing1, function () {
        console.log(thing1.key, 'killed')
        explosion = self.explosions.getFirstExists(false)
        explosion.reset(thing1.body.x, thing1.body.y)
        explosion.play('boom', 8, false, true)
      })
    }
  }

  this.game.physics.arcade.collide(this.player, this.bossSlimes, ch)
  this.game.physics.arcade.collide(this.player, this.boss, ch)
  this.game.physics.arcade.collide(this.player, this.walls, ch)
  this.game.physics.arcade.collide(this.slimes, this.walls, ch)
  this.game.physics.arcade.collide(this.asteroids, this.walls, ch)
  this.game.physics.arcade.collide(this.bullet, this.walls, ch)
  this.game.physics.arcade.collide(this.missles, this.walls, ch)

  this.game.physics.arcade.collide(this.bullet, this.bossSlimes, ch)
  this.game.physics.arcade.collide(this.missles, this.bossSlimes, ch)

  this.game.physics.arcade.collide(this.bullet, this.boss, ch)
  this.game.physics.arcade.collide(this.missles, this.boss, ch)

  this.game.physics.arcade.collide(this.asteroids, this.asteroids, ch)
  this.game.physics.arcade.collide(this.missles, this.asteroids, ch)
  this.game.physics.arcade.collide(this.missles, this.slimes, ch)
  this.game.physics.arcade.collide(this.missles, this.m2zak, ch)

  this.game.physics.arcade.collide(this.m2zakMissles, this.player, ch)

  this.game.physics.arcade.collide(this.bullet, this.m2zak, ch)
  this.game.physics.arcade.collide(this.player, this.asteroids, ch)
  this.game.physics.arcade.collide(this.player, this.m2zak, ch)
  this.game.physics.arcade.collide(this.bullet, this.asteroids, ch)
  this.game.physics.arcade.collide(this.slimes, this.asteroids, ch)

  this.game.physics.arcade.collide(this.bullet, this.slimes, ch)
  this.game.physics.arcade.collide(this.player, this.slimes, ch)
}

GameLoop.prototype.createWalls = function createWalls() {
  var self = this
  self.walls = this.game.add.group()
  self.walls.enableBody = true
  self.walls.physicsBodyType = Phaser.Physics.ARCADE
  var hwX = 1115

  function verticleWall(x, y) {
    var wall = self.walls.create(x, y, 'wall')
    wall.body.immovable = true
  }

  function horizontalWall(x, y) {
    var wall = self.walls.create(x, y, 'wallH')
    wall.body.immovable = true
    wall.key = 'wall'
  }

  door = self.walls.create(1100, 585, 'door')
  door.body.immovable = true
  door.health = 5
  var flash = door.animations.add('flash')
  door.animations.play('flash', 15, true)
  flash.onLoop.add(function () {
    flash.paused = true
    setTimeout(function () {
      flash.paused = false
    }, 3000)
  })
  verticleWall(1100, 521)
  verticleWall(1100, 617)

  for (var i = 0; i < 18; i++) {
    horizontalWall(hwX, 520)
    horizontalWall(hwX, 666)
    hwX += 45
  }
}

GameLoop.prototype.createAsteroidField = function createAsteroidField() {
  var isSmall
  var type
  var x
  var y
  var a
  var i
  this.asteroids = this.game.add.group()
  this.asteroids.enableBody = true
  this.asteroids.physicsBodyType = Phaser.Physics.ARCADE

  for (i = 0; i < 40; i++) {
    isSmall = !!randomInt(0, 1);
    type = isSmall ? 'asteroidSmall' : 'asteroidMed'
    x = randomInt(500, 1000)
    y = randomInt(500, 1000)
    a = this.asteroids.create(x, y, type)
    a.name = 'a' + i
    a.health = 1
    a.body.velocity.x = 5
    a.body.velocity.y = -5
    a.body.bounce.setTo(1, 1)
  }
}

GameLoop.prototype.createSlimeGang = function createSlimeGang() {
  this.slimes = this.game.add.group()
  this.bossSlimes = this.game.add.group()
  this.slimes.enableBody = true
  this.bossSlimes.enableBody = true
  this.slimes.physicsBodyType = Phaser.Physics.ARCADE
  this.bossSlimes.physicsBodyType = Phaser.Physics.ARCADE

  var slime
  var x
  var y

  this.bossSlimes.createMultiple(500, 'slime')

  for (i = 0; i < 20; i++) {
    x = this.game.world.randomX
    y = this.game.world.randomY
    slime = this.slimes.create(x, y, 'slime')
    slime.name = 'slime' + i
    slime.health = 1
    slime.body.bounce.setTo(1, 1)
    slime.animations.add('move')
    slime.animations.play('move', 8, true)
    slime.body.collideWorldBounds = true
  }
}

GameLoop.prototype.restartGame = function restartGame() {
  var self = this
  this.music.space.stop()
  this.music.boss.stop()
  this.game.camera.reset()
  this.game.add.sprite(0, 0, 'gameOver')
  var aButton = this.game.input.keyboard.addKey(Phaser.Keyboard.J)
  var bButton = this.game.input.keyboard.addKey(Phaser.Keyboard.K)

  aButton.onDown.addOnce(function () {
    self.game.state.start('mainMenu')
  })

  bButton.onDown.addOnce(function () {
    self.game.state.start('gameLoop')
  })
}

module.exports = GameLoop
