const express = require('express');
const passport = require('passport');

const router = express.Router();

router.get('/kakao', passport.authenticate('kakao'));
router.get('/kakao/oauth', passport.authenticate('kakao', {
  failureRedirect: '/',
}), (req, res) => {
  res.redirect('/work');
});

module.exports = router;