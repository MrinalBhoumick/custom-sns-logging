module.exports = {
    apps: [
      {
        name: 'my-node-app',
        script: './src/app.js',
        log_type: 'json',
        out_file: '/var/log/pm2/my-node-app-out.log',
        error_file: '/var/log/pm2/my-node-app-error.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss'
      }
    ]
  };
  