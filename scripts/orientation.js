var Matrix

// EXPORTS
exports = module.exports = {
  'name': 'Test',
  'init': init
}

function init (_matrix) {
  Matrix = _matrix

  Matrix.setTick(100)

  Matrix.on('started', () => {
    console.log(exports.name)
    Matrix.fill(Matrix.RGB(0, 0, 255))
  })

  Matrix.on('stopped', () => {
  })

  Matrix.on('update', () => {

  })

  Matrix.on('draw', () => {
    Matrix.ledID(0, Matrix.RGB(255, 0, 0))
    Matrix.ledID(9, Matrix.RGB(0, 255, 0))
    Matrix.ledID(90, Matrix.RGB(255, 255, 0))
    Matrix.ledID(99, Matrix.RGB(255, 0, 255))
  })
}
