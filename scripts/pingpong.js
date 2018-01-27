var Matrix

var game
var players = []
var ball

// EXPORTS
exports = module.exports = {
  'name': 'PingPong',
  'init': init
}

function init (_matrix) {
  Matrix = _matrix

  Matrix.setTick(1000)

  Matrix.on('started', () => {
    console.log(exports.name)
  })

  Matrix.on('stopped', () => {
  })

  Matrix.on('update', () => {
    update()
  })

  Matrix.on('draw', () => {
    game.draw()
    // Draw rackets of players
    players[0].draw()
    players[1].draw()
    // Draw ball
    ball.draw()
  })

  Matrix.on('input', (input) => {
    input = (input instanceof Object) ? input : {'event': input}
    var team = (input['team'] === 'A') ? 0 : 1
    switch (input['event']) {
      case 'left':
        playerMove(team, input['event'])
        break
      case 'right':
        playerMove(team, input['event'])
        break
      default:
        break
    }
  })

  // Matrix.addButton('up')
  // Matrix.addButton('down')

  // Matrix.addTeam(0, 'A')
  // Matrix.addTeam(1, 'B')

  // Rackets of players
  game = new Matrix.Rect('game', Matrix.RGB(0, 0, 0), 0, 0, Matrix.size, Matrix.size)
  players[0] = new Matrix.Rect('player0', Matrix.RGB(0, 255, 0), 0, game.height / 2 - 1, 1, 3)
  players[1] = new Matrix.Rect('player1', Matrix.RGB(0, 255, 0), game.width - 1, game.height / 2 - 1, 1, 3)

  // Ball
  ball = new Matrix.Rect('ball', Matrix.RGB(255, 0, 0), game.width / 2, game.height / 2, 1, 1)
  ball.vX = 1
  ball.vY = 1

  players[0].scores = 0 // Player 0 points
  players[1].scores = 0 // Player 1 points

  // setup specific situations
  // player[0].y = player[0].y - 2;
  ball.x = ball.x - 2
}

function playerMove (team, e) {
  var vY = (e === 'left') ? -1 : 1
  var yStart = players[team].y + vY
  var yEnd = yStart + players[team].height
  if (yStart >= 0 && game.height >= yEnd) {
    players[team].y += vY
  }
}

function update () {
  // aiMove();

  // Increasing coordinates
  ball.x += ball.vX
  ball.y += ball.vY

  // Moving along X-axis
  if (collision(players[0], ball)) {
    // console.log('player 0');
    if ((ball.vY > 0 && ball.y === players[0].y) ||
        (ball.vY < 0 && ball.y === players[0].y + players[0].height - 1)) {
      ball.vX = -ball.vX
      ball.vY = -ball.vY
      ball.x += ball.vX * 2
      ball.y += ball.vY * 2
    } else {
      ball.vX = -ball.vX
      ball.x += ball.vX * 2
    }
  } else if (ball.x < 1) {
    // Beat with a left wall
    ball.vX = -ball.vX
    players[1].scores++
  }

  if (collision(players[1], ball)) {
    // console.log('player 1');
    if ((ball.vY > 0 && ball.y === players[1].y === ball.y) ||
        (ball.vY < 0 && ball.y === players[1].y + players[1].height - 1)) {
      ball.vX = -ball.vX
      ball.vY = -ball.vY
      ball.x += ball.vX * 2
      ball.y += ball.vY * 2
    } else {
      ball.vX = -ball.vX
      ball.x += ball.vX * 2
    }
  } else if (ball.x + ball.width > game.width - 1) {
    // Beat with a right wall
    ball.vX = -ball.vX
    players[0].scores++
  }

  // Moving along Y-axis
  if (ball.y < 1 || ball.y + ball.height > game.height - 1) {
    // Beat with a "flooring" or "ceiling" of playing field
    ball.vY = -ball.vY
  }
}

function collision (A, B) {
  if (A.x < B.x + B.width &&
    A.x + A.width > B.x &&
    A.y < B.y + B.height &&
    A.height + A.y > B.y) {
    return true
  }
  return false
}

function aiMove () {
  var y
  var vY = Math.abs(ball.vY) - 0.75

  if (ball.y < players[0].y + players[0].height / 2) {
    y = players[0].y - vY
  }
  if (ball.y > players[0].y + players[0].height / 2) {
    y = players[0].y + vY
  }
  if (y > 1 && y < game.height - players[0].height - 1) {
    players[0].y = y
  }
}
