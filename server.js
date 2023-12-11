var http = require('http');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
const session = require('express-session');
const bodyParser = require('body-parser');
const RunQueue = require('run-queue');
var  app = express(); //create express middleware dispatcher
const PORT = process.env.PORT || 3000



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs'); //use hbs handlebars wrapper

app.locals.pretty = true; //to generate pretty view-source code in browser
app.use(bodyParser.json());
// Need to use sessions to keep track of our user's login status
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
}));

app.use(express.static(__dirname + '/public')) //static server for publc  files

// need to implement some kind of queue
//Middleware to authenticate user
app.use((req, res, next) => {
  const excludedRoutes = ['/login', '/signup', '/guest'];

// Queue up messages using run-queue
  // If user is not logged in and on a protected route, redirect to login
  if (!req.session.user && !excludedRoutes.includes(req.path)) {
    res.redirect('/login');
  } else {
    // Calls next registered middleware when the user is authenticated
    next();
  }
});

//read routes modules
var routes = require('./routes/index');

//register middleware with dispatcher
//ORDER MATTERS HERE
//middleware
// app.use(routes.authenticate); //authenticate user
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));

//app.use(methodLogger);
//routes
app.get('/guest', routes.guestLogin);
app.get('/login.html', routes.login);
app.get('/signup', routes.signup);
app.post('/signup', routes.postSignup);
app.post('/login', routes.postLogin);
app.get('/login', routes.login);
app.get('/index.html', routes.landing);
app.get('/updateLanding', routes.landing);
app.get('/', routes.landing);
app.get('', routes.landing);
app.get('/getPool', routes.getPool);
app.get('/addPool', routes.addPool);
app.post('/addMessage', routes.addMessage);
app.get('/addMessage', routes.addMessage);
app.get('/admin', routes.admin);
app.post('/updateStatus', routes.updateStatus);
app.post('/createGroup', routes.createGroup);
app.get('/account', routes.account)
app.get('/logout', routes.logout);
app.get('/about', routes.about);
app.post('/deleteMessage', routes.deleteMessage);
app.get('/deleteAccount', routes.deleteAccount);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { errorMessage: 'Something went wrong!' });
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).render('error', { errorMessage: 'Page not found!' });
});

// Create an HTTP server using express app
const server = http.createServer(app);

// Start the server
server.listen(PORT, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`Server listening on port: ${PORT} CNTL:-C to stop`);
    console.log(`To Test:`);
    console.log('http://localhost:3000/index.html');
    console.log('http://localhost:3000/admin');
    console.log('http://localhost:3000/login');
    console.log('http://localhost:3000/signup');
  }
});
