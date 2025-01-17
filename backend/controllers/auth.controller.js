const express = require('express');
const passport = require('passport');

const router = express.Router();

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: process.env.FRONTEND_URL }),
  (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/invoices`);
  }
);

router.get('/logout', (req, res) => {
  req.logout();
  res.send({ message: 'Logged out' });
});

router.get('/current', (req, res) => {
  res.send(req.user);
});

module.exports = router;
