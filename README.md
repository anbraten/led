# Led matrix
This program written in node is an interface for controlling small scripts to use on a led matrix.

## Installation
### Development
```
cd dev/
docker-compose up
```

### Production (as docker container)
* Set ```Dir``` to correct directory in run
* Create docker container with: ```docker-compose up -d```
* If you want to restart it from now on just run: ```docker-compose restart```

### Plugins
You can find a small collection of plugins [here](https://github.com/anbraten/led-plugins).
Download them to your /plugins folder.

## To-Dos
* start buffering of leds before updating and send after update
* add wiimote api for srcipts
* add step by step button to debug plugins
* add service worker with offline cache for pwa support

## Plugin development
A plugin is a small program / game that renders content on the led matrix. It can handle user input from a wiimote.
### Good to know
* A plugin can be hot reloaded. So you only have to reload it inside the interface.

### Example

```
var Matrix

// EXPORTS
exports = module.exports = {
  'name': 'Skeleton', // name of your plugin
  'init': init
}

function init (_matrix) {
  Matrix = _matrix // save matrix api object

  Matrix.setTick(1000) // set tick rate to 1 tick per 1000 ms

  Matrix.on('started', () => {
    console.log(exports.name) // executed when your plugin should start
  })

  Matrix.on('stopped', () => {
    // executed when your plugin should stop
  })

  Matrix.on('update', () => {
    // executed when matrix loop tick is send.
    // this is the point you should handle your logic.
  })

  Matrix.on('draw', () => {
    // executed when your plugin should render leds
  })
}
```

### Matrix API
Use this api to set leds, get user input and run your logic.

* [Matrix.on(event, callback)](#on)
* [Matrix.size](#size)
* [Matrix.setTick(speed)](#setTick)
* [Matrix.led(x, y, rgb)](#led)
* [Matrix.ledXY(x, y, rgb)](#ledXY)
* [Matrix.fill()](#fill)
* [Matrix.clear()](#clear)
* [new Matrix.Drops(chance, multiple, rgb)](#Drops)
* [new Matrix.Rect(name, rgb, x, y, width, height)](#Rect)
* [Matrix.RGB(r, g, b)](#rgb)
* [Matrix.HSV_TO_RGB(h, s, v)](#hsvToRgb)
* [Matrix.RND(min, max)](#rnd)
* [Matrix.RND_COLOR()](#rndColor)

-------------------------------------------------------
<a name="on"></a>
### Matrix.on(event, callback

Listen to matrix events.

* `event`: The name of the event.
* `callback`: Your callback function which is executed after the event is fired.

See this list for possible events:

#### Event `'started'`

`function () {}`

Emitted when matrix is ready and plugin can start. After this event the update, draw loop is started.

#### Event `'stopped'`

`function () {}`

Emitted when plugin is called to stops. After this event the update, draw loop is stopped.

#### Event `'resumed'`

`function () {}`

Emitted when loop is resumed again.

#### Event `'paused'`

`function () {}`

Emitted when loop is paused.

#### Event `'update'`

`function () {}`

Emitted when the matrix loop calls your plugin to update.
This is where your plugins logic should mainly happen.

#### Event `'draw'`

`function () {}`

Emitted when the matrix loop calls your plugin to render.

#### Event `'input'`

`function (key, value) {}`

Emitted when a user sends input via the web interface.

-------------------------------------------------------
<a name="size"></a>
### Matrix.size

Int : Size of the matrix.

-------------------------------------------------------
<a name="setTick"></a>
### Matrix.setTick(speed)

Set the speed you want your plugins logic (update callback) to be executed with.

* `speed` Speed in milliseconds.

-------------------------------------------------------
<a name="led"></a>
### Matrix.led(x, y, rgb)

Alias for [Matrix.led(x, y, rgb)](#ledXY)

-------------------------------------------------------
<a name="ledXY"></a>
### Matrix.ledXY(x, y, rgb)

Sets a led to `rgb` at (`x` / `y`).

* `x` x coordinate on the matrix (0 is left)
* `y` y coordinate on the matrix (0 is top)
* `rgb` Color object of type rgb. Normally generated with [Matrix.RGB(r, g, b)](#rgb)

-------------------------------------------------------
<a name="fill"></a>
### Matrix.fill(rgb)

Sets all matrix leds to `rgb`.

* `rgb` Color object of type rgb. Normally generated with [Matrix.RGB(r, g, b)](#rgb)

-------------------------------------------------------
<a name="clear"></a>
### Matrix.clear()

Sets all matrix leds to off / back.

-------------------------------------------------------
<a name="Drops"></a>
### new Matrix.Drops(chance, multiple, rgb)

Object to create colored drops falling down from top row.

* `chance` Chance in percent a row will or will not have drops.
* `multiple`  Chance to get more than one drop per time. (1 is minimum and [Matrix.size] is maximum)
* `rgb` Color object of type rgb. Normally generated with [Matrix.RGB(r, g, b)](#rgb)

#### Matrix.Drops.update()

Call to update the drops. Each time the drops will fall down one row.

#### Matrix.Drops.draw()

Call to draw the drops.

-------------------------------------------------------
<a name="Rect"></a>
### new Matrix.Rect(name, rgb, x, y, width, height)

Object to create a colored rectangle.

* `name` The name for the rectangle
* `rgb` Color object of type rgb. Normally generated with [Matrix.RGB(r, g, b)](#rgb)
* `x` x position if the rectangle top left corner (0 is at the left of the matrix)
* `y` y position of the rectangle top left corner (0 is at the top of the matrix)
* `width` Width of the rectangle
* `height` Height of the rectangle

#### Matrix.Rect.draw()

Call to draw the rectangle.

-------------------------------------------------------
<a name="rgb"></a>
### Matrix.RGB(r, g, b)

Returns a rgb color object.

Matrix.RGB(255, 0, 0) is red.
Matrix.RGB(0, 255, 0) is green.
Matrix.RGB(0, 0, 255) is blue.
Matrix.RGB(0, 0, 0) is black.
Matrix.RGB(255, 255, 255) is white.

* `r` The red porpotion of the color. (0 is nothing, 255 is max)
* `g` The green porpotion of the color. (0 is nothing, 255 is max)
* `b` The blue porpotion of the color. (0 is nothing, 255 is max)

-------------------------------------------------------
<a name="hsvToRgb"></a>
### Matrix.HSV_TO_RGB(h, s, v)

Converts a hsv color to a [Matrix.RGB(r, g, b)](#rgb) color object.

* `h` Hue of the color. (0 is red, 120 is green, 240 is blue)
* `s` Saturation of the color in percentage. (0% = no, 100% = full)
* `v` Value / brightness of the color in percentage. (0% = no, 100% = full)

-------------------------------------------------------
<a name="rnd"></a>
### Matrix.RND(min, max)

Returns a random integer.

* `min` Minimum of the possible random range.
* `max` Maximum of the possible random range.

-------------------------------------------------------
<a name="rndColor"></a>
### Matrix.RND_COLOR()

Returns a random [Matrix.RGB(r, g, b)](#rgb) color object.
