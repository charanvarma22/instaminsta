# How to Use Cookie Rotation (Multi-Account Support)

To make the downloader more stable and avoid "Cookie expired" or "API blocked" errors, you can now add multiple Instagram accounts. The system will automatically switch to the next account if one gets blocked or restricted.

## How to add more accounts:

1. **Get cookies** from an Instagram account (follow the steps in `COOKIES_GUIDE.md`).
2. **Save the cookies** into a new file in the `backend/cookies/` directory.
   - Example: `backend/cookies/secondary_account.txt`
   - You can name the file anything as long as it ends in `.txt`.
3. **Restart the server**. The logs will show `✅ Loaded X Instagram sessions`.

## How rotation works:

- Each request will use one of your loaded sessions.
- If a session fails (status 400, 401, 403, or 429), the system will:
  1. Log the failure.
  2. Automatically switch to the next available session in the `cookies/` folder.
  3. Retry the request.
- This continues until a session succeeds or all sessions have been tried.

## Recommendations:

- **Use at least 2-3 accounts** for better stability.
- **Use "burn" accounts** (accounts you don't mind getting temporary restrictions on).
- **Update cookies** if you see frequent "Rotating..." messages in the logs for all accounts.
