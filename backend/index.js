const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const createServer = require('./createServer');

const server = createServer();
server.express.use(cookieParser());
server.express.use(bodyParser.json());

// decode the JWT so we can get the user Id on each request
server.express.use((req, res, next) => {
  const token =
    req.body.token ||
    req.query.token ||
    req.headers['x-access-token'] ||
    req.cookies.token;

  if (!token) {
    req.isAuth = false;
    return next();
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, 'somesupersecretkey');
  } catch (err) {
    req.isAuth = false;
    return next();
  }
  if (!decodedToken) {
    req.isAuth = false;
    return next();
  }
  req.isAuth = true;
  req.userId = decodedToken.userId;
  next();
});

const { MONGO_USER, MONGO_PASSWORD, MONGO_URL, MONGO_DB } = process.env;
const connectionString = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_URL}/${MONGO_DB}`;

mongoose
  .connect(connectionString)
  .then(() => {
    server.start({
      cors: {
        credentials: true,
        origin: process.env.FRONTEND_URL
      },
      port: 4444
    }, () => console.log(`The server is running on http://localhost:4444`))
  })
  .catch(err => {
    console.log(err);
  });