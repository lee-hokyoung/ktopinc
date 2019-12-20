// modules.exports = [{
//   script: 'echo.js',
//   error_file: 'err.log',
//   out_file: 'out.log',
//   log_file: 'combined.log',
//   time: true
// }];

module.exports = {
  apps: [
    {
      name: 'ktop',
      script: 'app.js',
      // 개발
      // env: {
      //   PORT: 3000,
      //   NODE_ENV: 'development'
      // },
      // 배포
      env_production: {
        PORT: 8000,
        NODE_ENV: 'production'
      },
      out_file: null,
      log_file: null,
    },
    {
      name: 'ktop-dev',
      script: 'app.js',
      env: {
        PORT: 3000,
        NODE_ENV: 'development'
      }
    }
  ]
};