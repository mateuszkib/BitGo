const express = require('express');
const router = express.Router();
const BitgoJS = require('bitgo');
const User = require('../../models/user');
const bcrypt = require('bcrypt');

const bitgo = new BitgoJS.BitGo({ accessToken: 'v2xa530fa0ce6bb4a86528ccbf9ddee54aba0f495ad204f2fbfde207bbd5bcbc137' });

router.get('/register', (req, res) => {
    res.render('exch-user/register');
    console.log(User);
});

router.post('/register', (req, res) => {
    let saltRounds = 10;
    let hash = bcrypt.hashSync(req.body.password, saltRounds);

    let user = new User({
        email: req.body.email,
        password: hash
    });

    async function saveUser() {
        user.save((err) => {
            if (err) {
                console.log(err);
                process.exit(1);
            }
            res.redirect('/');
        })
    }
    saveUser();
});

router.get('/profile/:id', (req, res) => {
    User.findById(req.params.id, (err, user) => {
        res.render('exch-user/profile', {
            user: user
        });
    });
});

router.post('/createWallet/:id', (req, res) => {
    var coin = req.body.select;
    var password = req.body.password;
    async function createWallet() {
        try {
            let user = await getUser(req.params.id);
            let label = "EX:" + user._id + coin;
            let wallet = await addWallet(coin, label, password);
            let updateUser = await updateUserWalletId(user._id, wallet.wallet._wallet.id);
            
        } catch (err) {
            console.log(err);
        }
    }
    res.send('ok');
    createWallet();

});

function getUser(id) {
    return new Promise((resolve, reject) => {
        User.findById(id, (err, user) => {
            resolve(user);
        })
    });
}

function addWallet(coin, label, password) {
    return new Promise((resolve, reject) => {
        bitgo.coin(coin).wallets()
            .generateWallet({ label: label, passphrase: password })
            .then(function (wallet) {
                resolve(wallet);
                console.dir(wallet);
            });
    })
}

function updateUserWalletId(id, walletID) {
    return new Promise((resolve, reject) => {
        User.findById(id, (err, user) => {
            user.idWallet.push(walletID);

            user.save((err) => {
                if (err) {
                    console.log(err);
                    return;
                }
            })
        });
    });
}


module.exports = router;