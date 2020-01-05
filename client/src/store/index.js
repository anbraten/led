import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    pixels: null,
    matrixSize: { width: 0, height: 0 },
  },
  mutations: {
    setPixel(state, { id, color }) {
      if (state.pixels === null) {
        throw new Error('Matrix has to be initalized first!');
      }
      state.pixels[id] = color;
    },
    setMatrixSize(state, size) {
      if (!size || !size.x || !size.y) {
        throw new Error('Matrix size should be an object { x, y }!');
      }

      state.matrixSize = size;
      state.pixels = {};

      let x;
      let y;
      for (x = 0; x < size.x; x += 1) {
        for (y = 0; y < size.y; y += 1) {
          state.pixels[`${x}/${y}`] = { r: 0, g: 0, b: 0 };
        }
      }
    },
  },
  actions: {
  },
  modules: {
  },
});
