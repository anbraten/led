<template>
  <div id="app">
    <Home v-if="connected" />
    <div v-else>
      <p>Connecting ...</p>
    </div>
  </div>
</template>

<script>
import io from 'socket.io-client';
import Home from './components/Home.vue';

export default {
  name: 'app',
  components: {
    Home,
  },
  data() {
    return {
      socket: null,
      connected: false,
    };
  },
  created() {
    const s = io('/api');

    s.on('connect', () => {
      this.connected = true;
    });

    s.on('disconnect', () => {
      this.connected = false;
    });

    s.on('matrixSize', (size) => {
      this.$store.commit('setMatrixSize', size);
    });

    s.on('pixel', (id, color) => {
      this.$store.commit('setPixel', { id, color });
    });

    this.socket = s;
  },
};
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
