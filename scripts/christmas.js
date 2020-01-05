#!/usr/bin/env node
var Matrix

var tree
var snowflakes

// EXPORTS
exports = module.exports = {
  'name': 'Christmas',
  'init': init,
  'getInputs': getInputs,
  'getTeams': getTeams,
  'input': input
}

function init (_Matrix) {
  Matrix = _Matrix

  tree = new Tree('tree')
  snowflakes = new Matrix.Drops(30, 1, Matrix.RGB(255, 255, 255))

  Matrix.setTick(600)

  Matrix.on('started', () => {
    console.log(exports.name)
  })

  Matrix.on('stopped', () => {
  })

  Matrix.on('update', () => {
    snowflakes.update()
    tree.update()
  })

  Matrix.on('draw', () => {
    tree.draw()
    snowflakes.draw()
  })
}

function getInputs () {
  return [
  ]
}

function getTeams () {
  return {
  }
}

function input (input) {
}

function Tree (name) {
  this.name = name
  this.green = [
    [1, 4], [1, 5],
    [2, 4], [2, 5],
    [3, 3], [3, 4], [3, 5], [3, 6],
    [4, 3], [4, 4], [4, 5], [4, 6],
    [5, 2], [5, 3], [5, 4], [5, 5], [5, 6], [5, 7],
    [6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [6, 6], [6, 7], [6, 8],
    [7, 0], [7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6], [7, 7], [7, 8], [7, 9]
  ]
  this.trunk = [
    [8, 4], [8, 5],
    [9, 4], [9, 5]
  ]
  this.snow = [
    [9, 0], [9, 1], [9, 2], [9, 3], [9, 6], [9, 7], [9, 8], [9, 9]
  ]
  this.balls = [
    [7, 0], [3, 6], [6, 8], [5, 2], [6, 5], [1, 4], [4, 4]
  ]

  this.update = function () {

  }

  this.draw = function () {
    // green
    for (let i = 0; i < this.green.length; i++) {
      Matrix.led(this.green[i][1], this.green[i][0], Matrix.RGB(0, 100, 0))
    }
    // trunk
    for (let i = 0; i < this.trunk.length; i++) {
      Matrix.led(this.trunk[i][1], this.trunk[i][0], Matrix.RGB(139, 69, 19))
    }
    // snow
    for (let i = 0; i < this.snow.length; i++) {
      Matrix.led(this.snow[i][1], this.snow[i][0], Matrix.RGB(255, 255, 255))
    }
    // balls
    for (let i = 0; i < this.balls.length; i++) {
      Matrix.led(this.balls[i][1], this.balls[i][0], Matrix.RGB(204, 0, 0))
    }
  }
}
