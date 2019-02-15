const express = require('express');
const router = express.Router();
const BitgoJS = require('bitgo');

const bitgo = new BitgoJS.BitGo();

router.get('/login', (req, res) => {
  res.render('user/login');
});

router.post('/authorization', (req, res) => {

  if (typeof req.session.user === 'undefined') {
    bitgo.authenticate({ env: 'test', username: req.body.email, password: req.body.password, otp: '0000000' })
      .then(function (user) {
        req.session.user = user.user;
        res.redirect('/');
      });
  }

});

router.post('/logout', (req, res) => {
  bitgo.logout({})
    .then(() => {
      delete req.session.user;
      res.redirect('/');
    }).catch((err) => {
      console.log(err);
    });
});

router.get('/profile', (req, res) => {
  bitgo.me({}, (err, user) => {
    console.log(user);
    if (err) {
      res.locals.error = err;
    }
    res.render('user/profile', {
      user: user
    });
  })
});

router.get('/wallet', (req, res) => {
  bitgo.wallets().list()
    .then(function (wallets) {
      // print the wallets
      console.dir(wallets);
    });
});

module.exports = router;