function RGB(r, g, b) {
  return {
    r,
    g,
    b,
    eqal(other) {
      return (r === other.r && g === other.g && b === other.b);
    },
    toString() {
      let str = '';
      str += `${(r < 100) ? ((r >= 10) ? (`0${r}`) : (`00${r}`)) : r}`;
      str += `:${(g < 100) ? ((g >= 10) ? (`0${g}`) : (`00${g}`)) : g}`;
      str += `:${(b < 100) ? ((b >= 10) ? (`0${b}`) : (`00${b}`)) : b}`;
      return str;
    },
  };
}

/* accepts parameters
 * h  Object = {h:x, s:y, v:z}
 * OR
 * h, s, v
*/
function HSV_TO_RGB(...args) {
  let h;
  let s;
  let v;
  let r;
  let g;
  let b;

  if (args.length === 1) {
    [{ h, s, v }] = args;
  } else {
    [h, s, v] = args;
  }

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
    default:
      break;
  }
  return RGB(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
}

function RND(min, max) {
  return Math.floor((Math.random() * max) + min);
}

function RND_COLOR() {
  return RGB(RND(0, 255), RND(0, 255), RND(0, 255));
}

module.exports = {
  RGB,
  HSV_TO_RGB,
  RND,
  RND_COLOR,
};
