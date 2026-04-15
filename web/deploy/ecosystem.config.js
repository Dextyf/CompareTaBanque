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
        // ⚠️ Remplir ces valeurs sur le serveur via .env.production
        // Ne jamais committer les clés ici
        NEXT_PUBLIC_SUPABASE_URL:      process.env.NEXT_PUBLIC_SUPABASE_URL      || '',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        NEXT_PUBLIC_N8N_WEBHOOK_URL:   process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL   || '',
        RESEND_API_KEY:                process.env.RESEND_API_KEY                 || '',
      },
    },
  ],
};
