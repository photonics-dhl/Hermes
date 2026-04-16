module.exports = {
  apps: [
    {
      name: 'scholars-tea',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3001',
      cwd: '/data/home/zju321/Scholar-s_Tea',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        DATABASE_URL: 'postgresql://dbuser:dbpass123@localhost:5432/scholars_tea?host=/data/home/zju321/pgdata/run',
        REDIS_URL: 'redis://localhost:6379',
        NEXTAUTH_SECRET: 'your-secret-change-in-production',
        NEXTAUTH_URL: 'http://localhost:3001',
      },
    },
  ],
};
