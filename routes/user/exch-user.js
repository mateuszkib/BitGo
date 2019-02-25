const express = require('express');
const router = express.Router();
const BitgoJS = require('bitgo');

const bitgo = new BitGoJS.BitGo({ accessToken:'v2xa530fa0ce6bb4a86528ccbf9ddee54aba0f495ad204f2fbfde207bbd5bcbc137' });

router.get('/profile', (req,res) => {
    bitgo.me({}, (err,session) => {
        console.dir(session);
    });
});
