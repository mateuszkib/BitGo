const express = require('express');
const router = express.Router();
const BitgoJS = require('bitgo');

const bitgo = new BitgoJS.BitGo();

router.get('/login', (req, res) => {
    res.render('user/login');
});

router.post('/authorization', (req, res) => {

    if (typeof req.session.user === 'undefined') {
        bitgo.authenticate({env: 'test', username: req.body.email, password: req.body.password, otp: '0000000'})
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
    });

    /*var e = document.getElementById("selCoin");
    console.log(e);

    let selectCoin = $('#selCoin option:selected').val();*/
        /*request({
            url: '/user/profile',
            method: 'GET',
            data: {
                coin: selectCoin
            }
        }, function (err, res, body) {
            console.log(res);
        });*/
});

router.get('/send', (req,res) => {
    /*let params = {
        amount: 0.01 * 1e8,
        address: '2N4wZZsZB4cguAsfeYcB6NyUTWKLgWm64fo',
        walletPassphrase: 'heszkewmeszke'
    };*/
    bitgo.coin('tbtc').wallets().get({ id: '5c617d6f50032abf03d4e69e940fc032' }, function(err, wallet) {
        if (err) { console.log('Error getting wallet!'); console.dir(err); return process.exit(-1); }
        //console.log(wallet.balance());
        //console.log('Balance is: ' + (wallet.balance() / 1e8).toFixed(4));

        bitgo.unlock({ otp: '0000000' })
            .then(function(unlockResponse) {
                console.dir(unlockResponse);
            });

        let params = {
            amount: 0.01 * 1e6,
            address: '2NFKhjGVPF5GWT3usovtEGL2yDEqiQGEWR4',
            walletPassphrase: 'heszkewmeszke'
        };
        wallet.send(params)
            .then(function(transaction) {
                // print transaction details
                console.dir(transaction);
            });
    });
});

router.post('/wallet', (req, res) => {
    console.log(req.body.coin);
    bitgo.coin(req.body.coin).wallets().list({})
        .then(function (wallets) {
            res.send(wallets);
        });
});

module.exports = router;