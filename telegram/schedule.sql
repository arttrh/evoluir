-- Provisionar prumo_telegram_scan no Vault por canal privado antes de executar.
select cron.schedule(
  'prumo-telegram-half-hour',
  '*/30 * * * *',
  $job$
    with stamp as (select floor(extract(epoch from clock_timestamp()))::bigint::text as value)
    select net.http_post(
      url := 'https://prumo-telegram.onrender.com/scan',
      body := '{}'::jsonb,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'X-Prumo-Timestamp', stamp.value,
        'X-Prumo-Signature', encode(extensions.hmac('scan:' || stamp.value,
          (select decrypted_secret from vault.decrypted_secrets where name = 'prumo_telegram_scan'), 'sha256'), 'hex')
      ),
      timeout_milliseconds := 120000
    ) from stamp;
  $job$
);
