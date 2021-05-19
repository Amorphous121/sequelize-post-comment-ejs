require('dotenv').config();
const dbConfig = require('./config/db.config');
const path = require('path');
const express = require('express');
const session = require('express-session');
const logger = require('morgan');
const methodOverride = require('method-override');
const passport = require('passport');
const flash = require('connect-flash');
const { sendJson } = require('./middlewares/generate-response');
var SequelizeStore = require("connect-session-sequelize")(session.Store);
const db = require('./models');
const routes = require('./routes');
const error = require('./middlewares/error-middleware');
require('./middlewares/passport');

const port = process.env.PORT || 8081;
const app = express();
app.response.sendJson = sendJson;
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended : false }));
app.use(methodOverride('_method'));
app.use(logger('dev'));

const options = {
    host: dbConfig.HOST,
	port: 3306,
	user: dbConfig.USER,
	password: dbConfig.PASSWORD,
	database: dbConfig.DB
}

app.use(session({
    secret : 'secret',
    resave : true,
    saveUninitialized : true,
    cookie : {
        maxAge : 36000000
    },
    store : new SequelizeStore({ db : db.sequelize })
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use((req, res, next) => {
    res.locals.flash = req.flash();
    next()
})

app.use('/', routes);

app.use(error.converter);
app.use(error.notFound);
app.use(error.handler);


db.sequelize.authenticate()
    .then(() => {
        console.log("\n\t Database connected!")
        app.listen(port, () => console.log("\n\t Server is up 🚀 and running at " + port));
    });

