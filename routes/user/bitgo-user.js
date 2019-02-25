const express = require('express');
const router = express.Router();
const BitgoJS = require('bitgo');
const moment = require('moment');

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
    let address = '2NAyUTuNSJaCoxjtNkaG4aHMa36pkAbbCY3';
    bitgo.coin('tbtc').wallets().getWalletByAddress({ address: address })
        .then(function (wallet) {
            // print the wallet
            console.dir(wallet._wallet);
        });
    bitgo.me({}, (err, user) => {
        if (err) {
            res.locals.error = err;
        }
        res.render('user/profile', {
            user: user
        });
    });
});

router.post('/send/:id', (req, res) => {

    bitgo.coin('tbtc').wallets().get({ id: req.params.id }, function (err, wallet) {
        if (err) { console.log('Error getting wallet!'); console.dir(err); return process.exit(-1); }

        bitgo.unlock({ otp: '0000000' })
            .then(function (unlockResponse) {
                console.dir(unlockResponse);
            });

        let params = {
            recipients: [{
                amount: req.body.amount * 1e8,
                address: req.body.address,
            }],
            walletPassphrase: req.body.password
        };

        wallet.sendMany(params)
            .then(function (transaction) {
                // print transaction details
                res.redirect('/user/profile');
                console.dir(transaction);
            }).catch(function (err) {
                console.log(err);
            });

    });
});

router.get('/send/:coin/:id', (req, res) => {
    coin = req.params.coin;
    coinUpper = coin.toUpperCase();

    bitgo.coin(coin).wallets().get({ id: req.params.id })
        .then(function (wallet) {
            let availableCoin = wallet.balance() / 1e8;
            res.render('user/sendCoin', {
                coin: coinUpper,
                id: req.params.id,
                available: availableCoin
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

router.get('/wallet/:coin/:id', (req, res) => {
    let id = req.params.id;
    let coin = req.params.coin;
    bitgo.coin(coin).wallets().get({ id: id }, function (err, wallet) {
        if (err) { console.log('Error getting wallet!'); console.dir(err); return process.exit(-1); }
        //console.log('Balance is: ' + (wallet.balance() / 1e8).toFixed(4));
        let balance = (wallet.balance() / 1e8).toFixed(4);

        wallet.transfers().then(function (transfers) {
            console.log(transfers);
            res.render('user/wallet', {
                wallet: transfers.transfers,
                id: id,
                coin: coin,
                balance: balance,
                moment: moment
            });
        });

    });
});

module.exports = router;