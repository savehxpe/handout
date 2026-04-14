import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const VAULT_URL = "https://external-stems-vault.com";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("[Vault Email] RESEND_API_KEY is not configured");
      return NextResponse.json({ error: "Email service not configured" }, { status: 500 });
    }

    const resend = new Resend(apiKey);
    const { email, name } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const displayName = name || "Operative";

    const { error } = await resend.emails.send({
      from: "OUTWORLD <onboarding@resend.dev>",
      to: email,
      subject: "[ OUTWORLD ] Ascension Granted.",
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#000000;color:#ffffff;font-family:'Courier New',Courier,monospace;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;" cellpadding="0" cellspacing="0">
          <!-- Header -->
          <tr>
            <td style="padding:0 0 32px 0;border-bottom:1px solid #333333;">
              <p style="margin:0;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#666666;">
                SECURE TRANSMISSION // OUTWORLD SYSTEMS
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 0;">
              <p style="margin:0 0 24px 0;font-size:13px;letter-spacing:0.15em;text-transform:uppercase;color:#ffffff;line-height:1.8;">
                ${displayName},
              </p>
              <p style="margin:0 0 24px 0;font-size:12px;letter-spacing:0.1em;color:#cccccc;line-height:1.8;">
                YOUR ASCENSION HAS BEEN VERIFIED AND LOGGED.
                YOU NOW HAVE CLEARANCE TO ACCESS THE VAULT.
              </p>
              <p style="margin:0 0 32px 0;font-size:12px;letter-spacing:0.1em;color:#cccccc;line-height:1.8;">
                THE LINK BELOW WILL TRANSPORT YOU TO THE STEMS ARCHIVE.
                HANDLE WITH DISCRETION.
              </p>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="border:1px solid #ffffff;padding:14px 32px;">
                    <a href="${VAULT_URL}" target="_blank" style="font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#ffffff;text-decoration:none;font-family:'Courier New',Courier,monospace;">
                      ENTER THE VAULT
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:32px 0 0 0;border-top:1px solid #333333;">
              <p style="margin:0;font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:#444444;">
                THIS IS AN AUTOMATED TRANSMISSION. DO NOT REPLY.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `.trim(),
    });

    if (error) {
      console.error("[Vault Email] Resend error:", error);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Vault Email] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
