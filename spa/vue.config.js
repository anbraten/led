module.exports = {
  configureWebpack: {
    devServer: {
      proxy: {
        '^/api/*': {
          target: 'http://ledmatrix:8080/api/',
          secure: false,
        },
      },
    },
  },
  pwa: {
    workboxOptions: {
      skipWaiting: true,
    },
  },
};
