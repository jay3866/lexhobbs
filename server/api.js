import express from 'express';
import cors from 'cors';
import { Resend } from 'resend';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.PORT || 3001;

app.post('/api/quote', async (req, res) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not set. Please set it in your environment.');
    return res.status(500).json({ error: 'Email service not configured. Set RESEND_API_KEY environment variable.' });
  }

  const resend = new Resend(apiKey);
  const { name, email, phone, address, junkTypes, volume, aiAnalysis } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required.' });
  }

  const volumePercent = Math.round((volume || 0.25) * 100);

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a1a; color: #ffffff; border-radius: 12px; overflow: hidden;">
      <div style="background: #FFD700; padding: 24px; text-align: center;">
        <h1 style="margin: 0; color: #1a1a1a; font-size: 24px;">New Quote Request</h1>
        <p style="margin: 4px 0 0; color: #333;">Hobbs Junk Removal & Hauling LLC</p>
      </div>
      <div style="padding: 24px;">
        <h2 style="color: #FFD700; font-size: 18px; margin-top: 0;">Contact Information</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #999;">Name</td><td style="padding: 8px 0; color: #fff; font-weight: bold;">${name}</td></tr>
          <tr><td style="padding: 8px 0; color: #999;">Phone</td><td style="padding: 8px 0; color: #fff; font-weight: bold;">${phone}</td></tr>
          ${email ? `<tr><td style="padding: 8px 0; color: #999;">Email</td><td style="padding: 8px 0; color: #fff; font-weight: bold;">${email}</td></tr>` : ''}
          ${address ? `<tr><td style="padding: 8px 0; color: #999;">Address</td><td style="padding: 8px 0; color: #fff; font-weight: bold;">${address}</td></tr>` : ''}
        </table>

        <h2 style="color: #FFD700; font-size: 18px; margin-top: 24px;">Job Details</h2>
        <p style="color: #ccc;"><strong style="color: #fff;">Items:</strong> ${(junkTypes || []).join(', ') || 'Not specified'}</p>
        <p style="color: #ccc;"><strong style="color: #fff;">Estimated Volume:</strong> ${volumePercent}% Truck Load</p>
        ${aiAnalysis ? `<p style="color: #ccc;"><strong style="color: #FFD700;">AI Analysis:</strong> ${aiAnalysis}</p>` : ''}

        <div style="margin-top: 24px; padding: 16px; background: #2d2d2d; border-radius: 8px; border-left: 4px solid #FFD700;">
          <p style="margin: 0; color: #999; font-size: 13px;">This request was submitted through the Hobbs Junk Removal website quote form.</p>
        </div>
      </div>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Hobbs Website <onboarding@resend.dev>',
      to: ['Hobbsjrhauling@gmail.com'],
      subject: `New Quote Request from ${name}`,
      html: htmlBody,
      replyTo: email || undefined,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Failed to send email.' });
    }

    return res.json({ success: true, id: data.id });
  } catch (err) {
    console.error('Email send error:', err);
    return res.status(500).json({ error: 'Failed to send email.' });
  }
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
