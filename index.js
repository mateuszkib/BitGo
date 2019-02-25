const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 3000;
const session = require('express-session');
const userRouter = require('./routes/user/bitgo-user');
const userExchRouter = require('./routes/user/exch-user');
const BitgoJS = require('bitgo');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const db = require('./db/db.js');



app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'scripts')));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('*', (req,res,next) => {
    res.locals.user = req.session.user;
    next();
});

app.get('/', (req,res) => {
  res.render('layout');
});

app.use('/user', userRouter);
app.use('/exchange/user', userExchRouter);


app.listen(PORT, () => {
  console.log(`Server running on ${PORT} port ...`);
});