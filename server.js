require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');
const app = express();
const PORT = process.env.PORT || 3000;

// Configure timezone for Thailand
process.env.TZ = 'Asia/Bangkok';

let users = {};
let bookings = [];
let publicBookings = {};

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(session({ 
  secret: 'secret', 
  resave: false, 
  saveUninitialized: true,
  cookie: { secure: false } // set to true if using https
}));

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_APP_PASSWORD || 'your-app-password'
  }
});

// Add CORS support
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.post('/signup', (req, res) => {
  const { user, pass, email } = req.body;
  if (users[user]) return res.status(409).send();
  users[user] = { pass, email };
  res.sendStatus(200);
});

app.post('/login', (req, res) => {
  const { user, pass } = req.body;
  if (!users[user] || users[user].pass !== pass) return res.status(401).send();
  req.session.user = user;
  res.sendStatus(200);
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => res.sendStatus(200));
});

app.get('/book/:token', (req, res) => {
  const { token } = req.params;
  const booking = publicBookings[token];
  
  if (!booking) {
    return res.status(404).sendFile('public/404.html', { root: __dirname });
  }
  
  res.sendFile('public/index.html', { root: __dirname });
});

app.post('/book', async (req, res) => {
  try {
    const { date, time, isPublic } = req.body;
    
    // For public bookings, generate a token
    let bookingToken;
    if (isPublic) {
      bookingToken = Math.random().toString(36).substring(2, 15);
    } else if (!req.session.user) {
      return res.status(401).send();
    }
    
    // Format date in Thai locale
    const bookingDate = new Date(date);
    const formattedDate = bookingDate.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const bookingInfo = {
      id: Date.now(),
      user: isPublic ? 'Public User' : req.session.user,
      date: formattedDate,
      time: time,
      email: isPublic ? null : users[req.session.user].email,
      status: 'confirmed',
      createdAt: new Date().toLocaleString('th-TH'),
      isPublic: isPublic || false
    };

    const info = `คุณ ${bookingInfo.user} จองคิววันที่ ${bookingInfo.date} เวลา ${bookingInfo.time}`;
    const qr = await QRCode.toDataURL(info);
    bookingInfo.qr = qr;
    
    // Add to appropriate bookings array
    if (isPublic) {
      publicBookings[bookingToken] = bookingInfo;
      bookingInfo.token = bookingToken;
    } else {
      bookings.push(bookingInfo);
    }

    // Get recent bookings for this user (last 5 bookings)
    const recentBookings = isPublic ? [] : bookings
      .filter(booking => booking.user === req.session.user)
      .sort((a, b) => b.id - a.id)
      .slice(0, 5);

    // Send email if credentials are configured and not public booking
    if (!isPublic && process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: bookingInfo.email,
          subject: 'ยืนยันการจองคิว',
          html: `
            <div style="font-family: 'Kanit', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #4F46E5;">ยืนยันการจองคิว</h2>
              <p style="font-size: 16px; color: #1F2937;">${info}</p>
              <img src="${qr}" alt="QR Code" style="max-width: 200px; display: block; margin: 20px 0;"/>
              <p style="color: #6B7280; font-size: 14px;">กรุณาแสดง QR Code นี้เมื่อมาใช้บริการ</p>
            </div>
          `
        });
        bookingInfo.emailSent = true;
      } catch (emailError) {
        console.error('Email error:', emailError);
        bookingInfo.emailSent = false;
      }
    }

    res.json({
      message: "จองคิวสำเร็จ",
      booking: bookingInfo,
      recentBookings: recentBookings
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ 
      message: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
      error: error.message 
    });
  }
});

app.listen(PORT, () => console.log("Server running on http://localhost:" + PORT));
