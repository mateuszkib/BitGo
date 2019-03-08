const express = require('express');
const router = express.Router();
const BitgoJS = require('bitgo');
const User = require('../../models/user');
const bcrypt = require('bcrypt');

const bitgo = new BitgoJS.BitGo({ accessToken: 'v2xa530fa0ce6bb4a86528ccbf9ddee54aba0f495ad204f2fbfde207bbd5bcbc137' });

bitgo.unlock({ otp: '0000000' })
    .then(function (unlockResponse) {
        //console.dir(unlockResponse);
    });

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

        let walletsLength = user.idWallet.length;
        let labelWallets = [];
        for (let i = 0; i < walletsLength; i++) {
            labelWallets.push(new Promise((resolve, reject) => {
                bitgo.coin(user.idWallet[i].coin).wallets().get({ id: user.idWallet[i].id })
                    .then((wallet) => {
                        resolve({ wallet: wallet, user: user });
                    });
            }))
        }
        let result = Promise.all(labelWallets);
        result.then((data) => {
            let wallet = [];
            let user = data[0].user;

            data.forEach((item) => {
                wallet.push({ label: item.wallet._wallet.label, id: item.wallet._wallet.id, coin: item.wallet._wallet.coin, balance: item.wallet._wallet.balance });
            });
            console.log(wallet);
            res.render('exch-user/profile', {
                labels: wallet,
                user: user
            });
        })
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
            let updateUser = await updateUserWalletId(user._id, wallet.wallet._wallet.id, coin);
        } catch (err) {
            console.log(err);
        }
    }
    createWallet();
    setTimeout(() => {
        res.redirect('/exchange/user/profile/' + req.params.id);
    }, 4000);
});

router.get('/profile/:id/:coin/:idWallet/receive', (req, res) => {
    let coin = req.params.coin;
    let idWallet = req.params.idWallet;
    let userId = req.params.id;

    bitgo.coin(coin).wallets().get({ id: idWallet })
        .then((wallet) => {
            wallet.addresses({sort: -1})
                .then((addresses) => {
                    //console.log(addresses);
                    let receiveAddresses = [];
                    addresses.addresses.forEach(function(item) {
                        if(item.chain != 11) {
                            receiveAddresses.push(item);
                        }
                    });

                    let currentAddress = receiveAddresses[0].address;
                    let currentLabelAddress = receiveAddresses[0].label;

                    res.render('exch-user/wallet-receive', {
                        addresses: addresses,
                        idWallet: idWallet,
                        coin: coin,
                        current: currentAddress,
                        label: currentLabelAddress,
                        userId: userId
                    })
                });
        });
});

router.get('/profile/:id/:coin/:idWallet/send', (req, res) => {

    res.render('exch-user/wallet-send', {
        coin: req.params.coin,
        idWallet: req.params.idWallet,
        userId: req.params.id
    });
});

router.post('/send/:coin/:idWallet/:userId', (req, res) => {
    bitgo.coin(req.params.coin).wallets().get({ id: req.params.idWallet })
        .then((wallet) => {
            let params = {
                amount: req.body.amount * 1e8,
                address: req.body.address,
                walletPassphrase: req.body.password
            }

            wallet.send(params)
                .then(function (transaction) {
                    // print transaction details
                    res.redirect('/exchange/user/profile/' + req.params.userId);
                    console.dir(transaction);
                }).catch(function (err) {
                    console.log(err);
                });
        });
});

router.get('/profile/:id/:coin/:idWallet', (req, res) => {
    let coin = req.params.coin;
    let idWallet = req.params.idWallet;
    let userId = req.params.id;

    bitgo.coin(coin).wallets().get({ id: idWallet })
        .then((wallet) => {
            res.render('exch-user/wallet', {
                userId: userId,
                idWallet: idWallet,
                coin: coin,
                wallet: wallet
            })
        });
});

router.post('/createAddress/:idUser/:coin/:idWallet', (req, res) => {
    let label = req.body.label;
    let coin = req.params.coin;
    let walletId = req.params.idWallet;
    let userId = req.params.idUser;

    async function createAddressForUser() {
        let result = await createAddress(coin, walletId, label);
    }

    createAddressForUser();
    setTimeout(() => {
        res.redirect('/exchange/user/profile/' + userId + "/" + coin + "/" + walletId + "/receive");
    }, 3000)
});

router.post('/updateLabel/:coin/:idWallet', (req,res) => {
    bitgo.coin(req.params.coin).wallets().get({ id : req.params.idWallet })
    .then((wallet) => {
        wallet.setLabel({label: 'test label', address : '2ND7mNauDkGws7QVnyamtJmHMDURKogocip'}, function(err, result) {
            if (err) {
                console.log(err);
                process.exit(-1);
            }
            console.log('Set label ' + result.label + ' on address ' + result.address);
        });
    });
});

function createAddress(coin, id, label) {
    bitgo.coin(coin).wallets().get({ id: id })
        .then((wallet) => {
            wallet.createAddress({ label: label })
                .then((address) => {
                    console.log(address);
                })
        })
}


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

function updateUserWalletId(id, walletID, coin) {
    return new Promise((resolve, reject) => {
        User.findById(id, (err, user) => {
            user.idWallet.push({ id: walletID, coin: coin });

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