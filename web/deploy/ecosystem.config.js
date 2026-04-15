// PM2 Ecosystem — CompareTaBanque
module.exports = {
  apps: [
    {
      name:         'comparetabanque',
      script:       'node_modules/.bin/next',
      args:         'start',
      cwd:          '/var/www/comparetabanque',
      instances:    'max',           // utilise tous les CPU
      exec_mode:    'cluster',
      autorestart:  true,
      watch:        false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV:                      'production',
        PORT:                          3000,
        NEXT_PUBLIC_SUPABASE_URL:      'https://trlqyfjrmixeuiaotwii.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRybHF5ZmpybWl4ZXVpYW90d2lpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1NzI2NDcsImV4cCI6MjA5MTE0ODY0N30.d9ju4AU0QkI5aLeNHC99bbCXj6ky7skYaluOe7I5cLY',
        NEXT_PUBLIC_N8N_WEBHOOK_URL:   'https://comparetabanque.app.n8n.cloud/webhook-test/lead-creation',
        RESEND_API_KEY:                're_VgoWuKRH_LaixRf1svVbEb23ZdFtMYnYE',
      },
    },
  ],
};
