# Booking System

An easy-to-use online booking system with email confirmation and QR code generation for service verification.

## Features

- User Authentication (Sign up/Login)
- Date and Time-based Booking
- Recent Booking History Display
- Email Confirmation with QR Code
- Thai Calendar System (Buddhist Era)
- Responsive Design

## Installation

1. Install Node.js and npm
2. Clone the project:
   ```
   git clone https://github.com/yourusername/booking-system-full.git
   cd booking-system-full
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a .env file with the following variables:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_APP_PASSWORD=your-app-password
   ```
   Note: For Gmail, you must use an App Password instead of your regular password

5. Start the server:
   ```
   npm start
   ```
6. Open your browser and navigate to http://localhost:3000

## Technologies Used

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: In-memory (can be replaced with a real database)
- Email: Nodemailer
- QR Code: QRCode

## Project Structure

```
booking-system/
├── public/
│   ├── index.html
│   └── styles.css
├── server.js
├── package.json
└── .env
```

## How to Use

1. Sign up with username, password, and email
2. Log in to your account
3. Select your preferred date and time
4. Click "Confirm Booking"
5. View booking details and QR code
6. Receive email confirmation at your registered email address

## Future Enhancements

- Add database integration (e.g., MongoDB, MySQL)
- Implement admin dashboard for booking management
- Add SMS notification system
- Add booking cancellation feature
- Implement booking statistics and reporting

## License

© 2023 Booking System. All rights reserved.# booking-system-project
