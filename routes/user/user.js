const express = require('express');
const router = express.Router();
const BitgoJS = require('bitgo');

const bitgo = new BitgoJS.BitGo();

router.get('/profile', (req,res) => {
    if(typeof req.session.user === 'undefined' ) {
      bitgo.authenticate({ env: 'test', username: 'mkibilko@site.pl', password: 'heszkewmeszke', otp: '0000000' })
      .then(function (user) {
        req.session.user = user.user;
        res.json(user.user);
      });
    }
});

router.get('/session', (req, res) => {
    bitgo.me({}, (err, session) => {
        if (err) {
            console.log("Error : " + err);
        }
        console.log("Session: " + session);
    })
});

module.exports = router;