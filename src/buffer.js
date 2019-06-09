let buffer = [];

function diff(current) {
  const res = [];

  for (let i = 0; i < current.length; i += 1) {
    if (!buffer[i] || (current[i] && current[i].equals(buffer[i]))) {
      res.push({
        position: i,
        value: current[i],
      });
    }
  }

  buffer = current;

  return res;
}

module.exports = {
  diff,
};
