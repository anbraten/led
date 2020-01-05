var Matrix
var cloud
var drops

// EXPORTS
exports = module.exports = {
  'name': 'Rainbow',
  'init': init
}

function init (_matrix) {
  Matrix = _matrix

  cloud = new Matrix.Rect('cloud', Matrix.RGB(0, 0, 255), 0, 0, 10, 1)
  drops = []

  Matrix.setTick(1000)

  Matrix.on('started', () => {
    console.log(exports.name)
  })

  Matrix.on('stopped', () => {
  })

  Matrix.on('update', () => {
    cloud.color = Matrix.RND_COLOR()

    // del landed drops
    for (let i = 0; i < drops.length; i++) {
      if (drops[i].y === 9) {
        drops.splice(i, 1)
      }
    }

    // move drops
    for (let i = 0; i < drops.length; i++) {
      drops[i].y = drops[i].y + 1
    }

    // add new drops
    if (Matrix.rnd(0, 4) > 1) {
      for (let i = 0; i < Matrix.rnd(0, 3); i++) {
        drops.push(new Matrix.Rect('drop', cloud.color, Matrix.rnd(0, 10), 1, 1, 1))
      }
    }
  })

  Matrix.on('draw', () => {
    cloud.draw()
    for (var i = 0; i < drops.length; i++) {
      drops[i].draw()
    }
  })
}
