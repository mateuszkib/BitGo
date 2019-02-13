const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 3000;
const session = require('express-session');
const userRouter = require('./routes/user/user');
const BitgoJS = require('bitgo');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const bitgo = new BitgoJS.BitGo();

app.use(express.static(path.join(__dirname, 'public')));
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
    let obj = {};
    obj.token = req.session.user;
    // let accesToken = req.session.user || null;
    console.log(obj.token.id);
    next();
});

app.get('/', (req,res) => {
  res.render('layout');
});

app.get('/test', (req,res) => {
  req.session.test = 'test';
  res.send("HELLO");
});

app.use('/user', userRouter);


app.listen(PORT, () => {
  console.log(`Server running on ${PORT} port ...`);
});