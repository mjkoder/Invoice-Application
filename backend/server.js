require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("./config/passport");
const authRoutes = require("./routes/auth.routes");
const invoiceRoutes = require("./routes/invoice.routes");
const zapierRoutes = require("./routes/zapier.routes");
const { scheduleAutomate } = require('./controllers/zapier.controller');
require("./config/database");
const cron = require('node-cron');

const app = express();
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());

// Configure express-session
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'supersecretkey',
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something stored
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoutes);
app.use("/invoices", invoiceRoutes);
app.use("/automate", zapierRoutes);

cron.schedule('0 * * * *', () => {
  console.log('Running scheduled automation...');
  scheduleAutomate();
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).send({ message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
