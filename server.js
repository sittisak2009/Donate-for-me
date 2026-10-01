const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const generatePayload = require('promptpay-qr');
const qrcode = require('qrcode');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.json());
app.use(express.static('public'));

// ⚠️ เปลี่ยนเป็นเบอร์พร้อมเพย์ หรือ เลขบัตรประชาชนของนายได้เลย
const PROMPTPAY_NUMBER = "0812345678"; 

// API สำหรับเจน PromptPay QR Code
app.post('/api/generate-qr', async (req, res) => {
  const { amount } = req.body;
  try {
    const payload = generatePayload(PROMPTPAY_NUMBER, { amount: parseFloat(amount) });
    const qrBase64 = await qrcode.toDataURL(payload);
    res.json({ success: true, qr: qrBase64 });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API ยืนยันการโดเนท (ยิง Event ไปหา OBS)
app.post('/api/donate', (req, res) => {
  const { donorName, amount, message } = req.body;

  io.emit('new-donation', {
    donorName: donorName || "ผู้ไม่ประสงค์ออกนาม",
    amount: Number(amount),
    message: message || ""
  });

  res.json({ success: true });
});

server.listen(3000, () => {
  console.log('🚀 Server running at http://localhost:3000');
});
