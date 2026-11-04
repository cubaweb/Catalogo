const path = require('path');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const config = require('./config');
const flash = require('./middlewares/flash');
const { authenticate } = require('./middlewares/auth');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const movieRoutes = require('./routes/movies');

const app = express();

app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/main');

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        imgSrc: ["'self'", 'data:', 'https:', 'http:'],
        upgradeInsecureRequests: config.isProd ? [] : null
      }
    }
  })
);

if (!config.isTest) {
  app.use(morgan(config.isProd ? 'combined' : 'dev'));
}

const staticOptions = { maxAge: config.isProd ? '7d' : 0 };
app.use(express.static(path.join(__dirname, 'public'), staticOptions));
app.use('/vendor/bootstrap', express.static(path.join(__dirname, 'node_modules', 'bootstrap', 'dist'), staticOptions));
app.get('/favicon.ico', (req, res) => res.status(204).end());

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use((req, res, next) => {
  req.body = req.body || {};
  next();
});
app.use(cookieParser());
app.use(methodOverride('_method'));

app.use(expressLayouts);
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});
app.use(flash);
app.use(authenticate);

app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/movies', movieRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
