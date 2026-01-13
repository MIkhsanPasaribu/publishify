module.exports = {
  apps: [
    {
      name: 'backend',
      cwd: './backend',
      script: 'dist/src/main.js',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: '4000'
      },
      error_file: '~/.pm2/logs/backend-error.log',
      out_file: '~/.pm2/logs/backend-out.log',
      log_file: '~/.pm2/logs/backend-combined.log',
      time: true
    },
    {
      name: 'frontend',
      cwd: './frontend',
      script: 'node_modules/.bin/next',
      args: 'start',
      interpreter: 'none',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: '3000'
      },
      error_file: '~/.pm2/logs/frontend-error.log',
      out_file: '~/.pm2/logs/frontend-out.log',
      log_file: '~/.pm2/logs/frontend-combined.log',
      time: true
    }
  ]
};
