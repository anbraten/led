var Matrix

var line = []
var matrixValue = []
var pcnt = 0

// these values are substracetd from the generated values to give a shape to the animation
/* eslint-disable comma-spacing, no-multi-spaces, standard/array-bracket-even-spacing */
var valueMask = [
  [255, 192, 160, 128, 128, 128, 128, 160, 192, 255],
  [255, 192, 160, 128, 128, 128, 128, 160, 192, 255],
  [255, 160, 128, 96 , 96 , 96 , 96 , 128, 160, 255],
  [192, 128, 96 , 64 , 64 , 64 , 64 , 96 , 128, 192],
  [160, 96 , 64 , 32 , 32 , 32 , 32 , 64 , 96 , 160],
  [128, 64 , 32 , 0  , 0  , 0  , 0  , 32 , 64 , 128],
  [96 , 32 , 0  , 0  , 0  , 0  , 0  , 0  , 32 , 96 ],
  [64 , 0  , 0  , 0  , 0  , 0  , 0  , 0  , 0  , 64 ],
  [32 , 0  , 0  , 0  , 0  , 0  , 0  , 0  , 0  , 32 ],
  [32 , 0  , 0  , 0  , 0  , 0  , 0  , 0  , 0  , 32 ]
]
/* eslint-enable */

// these are the hues for the fire,
// should be between 0 (red) to about 25 (yellow)
/* eslint-disable comma-spacing, no-multi-spaces, standard/array-bracket-even-spacing */
var hueMask = [
  [1 , 11, 25, 22, 11, 11, 19, 25, 11, 1 ],
  [1 , 8 , 25, 19, 8 , 8 , 13, 25, 8 , 1 ],
  [1 , 8 , 19, 16, 8 , 8 , 13, 19, 8 , 1 ],
  [1 , 8 , 19, 16, 8 , 8 , 13, 19, 8 , 1 ],
  [1 , 5 , 13, 13, 5 , 5 , 11, 13, 5 , 1 ],
  [1 , 5 , 11, 11, 5 , 5 , 11, 11, 5 , 1 ],
  [0 , 1 , 8 , 5 , 1 , 1 , 5 , 8 , 1 , 0 ],
  [0 , 0 , 5 , 1 , 0 , 0 , 1 , 5 , 0 , 0 ],
  [0 , 0 , 1 , 0 , 0 , 0 , 0 , 1 , 0 , 0 ],
  [0 , 0 , 1 , 0 , 0 , 0 , 0 , 1 , 0 , 0 ]
]
/* eslint-enable */

// EXPORTS
exports = module.exports = {
  'name': 'Fire',
  'init': init
}

function init (_matrix) {
  Matrix = _matrix

  Matrix.setTick(300)

  Matrix.on('started', () => {
    console.log(exports.name)
  })

  Matrix.on('stopped', () => {
  })

  Matrix.on('update', () => {
    pcnt += 30
    if (pcnt >= 100) {
      shiftUp()
      generateLine()
      pcnt = 0
    }
  })

  Matrix.on('draw', () => {
    drawFrame(pcnt)
  })

  matrixValue = new Array(10)
  for (let i = 0; i < Matrix.size ** 2; i++) {
    matrixValue[i] = [Matrix.size]
    for (let j = 0; j < Matrix.size ** 2; j++) {
      matrixValue[i][j] = 0
    }
  }
}

/**
 * Randomly generate the next line (matrix row)
 */
function generateLine () {
  for (let x = 0; x < Matrix.size; x++) {
    line[x] = Matrix.RND(64, 255)
  }
}

/**
 * shift all values in the matrix up one row
 */
function shiftUp () {
  for (let y = Matrix.size - 1; y > 0; y--) {
    for (let x = 0; x < Matrix.size; x++) {
      matrixValue[y][x] = matrixValue[y - 1][x]
    }
  }

  for (let x = 0; x < Matrix.size; x++) {
    matrixValue[0][x] = line[x]
  }
}

/**
 * draw a frame, interpolating between 2 "key frames"
 * @param pcnt percentage of interpolation
 */
function drawFrame (pcnt) {
  let nextv
  let color

  // each row interpolates with the one before it
  for (let y = Matrix.size - 1; y > 0; y--) {
    for (let x = 0; x < Matrix.size; x++) {
      nextv = (((100.0 - pcnt) * matrixValue[y][x] + pcnt * matrixValue[y - 1][x]) / 100.0) - valueMask[y][x]
      color = Matrix.HSV_TO_RGB(
        hueMask[y][x], // H
        255, // S
        Math.max(0, nextv) // V
      )
      Matrix.led(x, y, color)
    }
  }

  // first row interpolates with the "next" line
  for (let x = 0; x < Matrix.size(); x++) {
    color = Matrix.HSV_TO_RGB(
      hueMask[0][x], // H
      255,           // S
      (((100.0 - pcnt) * matrixValue[0][x] + pcnt * line[x]) / 100.0) // V
    )
    Matrix.led(x, 0, color)
  }
}
