// modules.exports = [{
//   script: 'echo.js',
//   error_file: 'err.log',
//   out_file: 'out.log',
//   log_file: 'combined.log',
//   time: true
// }];

module.exports = {
  apps:[{
    name:'ktop',
    script:'app.js',
    out_file: null,
    log_file: null,
  }]
};