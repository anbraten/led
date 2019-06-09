function Drops(chance, multiple, color) {
  this.chance = chance;
  this.multiple = multiple;
  this.color = color;
  this.drops = [];

  this.update = () => {
    // del old drops from screen
    for (let i = 0; i < this.drops.length; i += 1) {
      const { x, y } = this.drops[i];
      ledXY(x, y, RGB(0, 0, 0));
    }

    // del landed drops
    for (let i = 0; i < this.drops.length; i += 1) {
      if (this.drops[i].y === 9) {
        this.drops.splice(i, 1);
      }
    }

    // move drops
    for (let i = 0; i < this.drops.length; i += 1) {
      this.drops[i].y = this.drops[i].y + 1;
    }

    // add new drops
    if (RND(0, 100) < this.chance) {
      for (let i = 0; i < RND(1, this.multiple); i += 1) {
        this.drops.push(new Rect('drop', this.color, RND(0, 10), 0, 1, 1));
      }
    }
  };

  this.draw = () => {
    for (let i = 0; i < this.drops.length; i += 1) {
      this.drops[i].draw();
    }
  };
}

function Rect(name, color, x, y, width, height) {
  this.name = name;
  this.color = color;
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.draw = () => {
    // Draw playing object
    for (let i = 0; i < this.width; i += 1) {
      for (let j = 0; j < this.height; j += 1) {
        ledXY(this.x + i, this.y + j, this.color);
      }
    }
  };
}
