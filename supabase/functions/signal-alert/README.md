# signal-alert Edge Function

Sends Telegram alerts when new rows are inserted into `signal_history`.

## Deploy

```bash
supabase functions deploy signal-alert --no-verify-jwt
```

## Set Secrets

```bash
supabase secrets set TELEGRAM_BOT_TOKEN=your_token
supabase secrets set TELEGRAM_CHAT_ID=your_chat_id
supabase secrets set WEBHOOK_SECRET=your_random_32_char_string
```

## Configure Database Webhook

Create the webhook in Supabase Dashboard:

1. Table: `signal_history`
2. Events: `INSERT`
3. Type: `Supabase Edge Functions`
4. Function: `signal-alert`
5. HTTP Headers: `Authorization: Bearer {WEBHOOK_SECRET}`

## Behavior Notes

- Returns `401` when auth header does not match `WEBHOOK_SECRET`.
- Returns `400` when payload does not include a `record`.
- Returns `500` when Telegram API fails.
- Formats timestamps in Central Time (`America/Chicago`).
- Red status changes (`new_status = red`) are marked with `⚠️ ESCALATION` and fully bolded.
- If more than 5 inserts arrive within 10 seconds, one batch summary is sent instead of individual alerts.
