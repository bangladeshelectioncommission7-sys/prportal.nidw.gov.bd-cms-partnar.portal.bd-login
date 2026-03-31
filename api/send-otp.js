export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({
      success: true,
      message: "OTP API is running"
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }

  try {
    const {
      SMS_API_URL,
      SMS_API_KEY,
      SMS_FROM = "sms",
      SMS_UNICODE = "1",
      SMS_ACTION = "send-sms",
      OTP_MESSAGE_TEMPLATE = "Your OTP code is {{OTP}}"
    } = process.env;

    if (!SMS_API_URL || !SMS_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "Missing SMS_API_URL or SMS_API_KEY"
      });
    }

    const { phone } = req.body || {};

    if (!phone || !/^01\d{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number"
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const message = OTP_MESSAGE_TEMPLATE.replace(/{{OTP}}/g, otp);

    const url = new URL(SMS_API_URL);
    url.searchParams.set("action", SMS_ACTION);
    url.searchParams.set("api_key", SMS_API_KEY);
    url.searchParams.set("to", phone);
    url.searchParams.set("from", SMS_FROM);
    url.searchParams.set("sms", message);
    url.searchParams.set("unicode", SMS_UNICODE);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    let response;
    let text = "";

    try {
      response = await fetch(url.toString(), {
        method: "GET",
        signal: controller.signal
      });
      text = await response.text();
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      return res.status(502).json({
        success: false,
        message: "SMS provider request failed",
        provider_status: response.status,
        provider_response: text.slice(0, 300)
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP পাঠানো হয়েছে",
      otp,
      provider_response: text.slice(0, 300)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.name === "AbortError" ? "SMS provider timeout" : (error.message || "Server error")
    });
  }
}
