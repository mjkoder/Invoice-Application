const express = require('express');
const passport = require('passport');

const router = express.Router();

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/',
    successRedirect: `${process.env.FRONTEND_URL}/dashboard`, 
  }),
);

router.post('/logout', (req, res, next) => {
  console.log('Logout route hit');

  req.logout(function(err) {
    console.log('Inside req.logout !!');
    if (err) {
      console.error('Error logging out:', err);
      return next(err);
    }

    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).send({ message: 'Error logging out.' });
      }

      res.clearCookie('connect.sid'); // Default cookie name for express-session
      console.log('User logged out and session cleared');
      return res.send({ message: 'Logged out' });
    });
  });
});

router.get('/current', (req, res) => {
  res.send(req.user);
});

module.exports = router;
