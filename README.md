# OTP Vercel Project

## Deploy on Vercel

1. Upload all files to GitHub.
2. Import the repo into Vercel.
3. In Vercel Project Settings -> Environment Variables, add:
   - `SMS_API_URL`
   - `OTP_SENDER_ID` (optional)
4. Redeploy.

## Notes

- This project stores OTP temporarily in server memory for demo use.
- On serverless cold starts or multiple instances, stored OTP may reset.
- For production, use Redis / database for OTP storage.
