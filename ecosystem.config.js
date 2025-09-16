module.exports = {
  apps: [{
    name: 'optools',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 3080
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3080,
      HOST: '0.0.0.0'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    // 進程管理配置
    min_uptime: '10s',
    max_restarts: 10,
    // 集群配置（可選）
    exec_mode: 'fork',
    // 內存監控
    max_memory_restart: '1G',
    // 日誌配置
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    // 環境變數
    env_staging: {
      NODE_ENV: 'staging',
      PORT: 3080,
      HOST: '0.0.0.0'
    }
  }]
}