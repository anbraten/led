var Matrix

// EXPORTS
exports = module.exports = {
  'name': 'Test',
  'init': init
}

function init (_matrix) {
  Matrix = _matrix

  var i = 0
  var direction = 0

  Matrix.setTick(100)

  Matrix.on('started', () => {
    console.log(exports.name)
    Matrix.fill(Matrix.RGB(0, 0, 255))
  })

  Matrix.on('stopped', () => {
  })

  Matrix.on('update', () => {
    i = (direction === 0) ? i + 1 : i - 1
    if (i === 99 - 2) {
      direction = 1
    }
    if (i === 0) {
      direction = 0
    }
  })

  Matrix.on('draw', () => {
    Matrix.ledID(i, Matrix.RGB(255, 0, 0))
    Matrix.ledID(i + 1, Matrix.RGB(0, 255, 0))
    Matrix.ledID(i + 2, Matrix.RGB(0, 0, 255))
  })
}
