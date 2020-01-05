var Matrix

// EXPORTS
exports = module.exports = {
  'name': 'Snake',
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
  })

  Matrix.on('draw', () => {
  })
}
