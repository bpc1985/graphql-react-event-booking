const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const createServer = require('./createServer');

const server = createServer();
server.express.use(bodyParser.json());

// decode the JWT so we can get the user Id on each request
server.express.use((req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    req.isAuth = false;
    return next();
  }
  const token = authHeader.split(' ')[1];
  if (!token || token === '') {
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

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${
      process.env.MONGO_PASSWORD
    }@cluster0-mqpf6.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`
  )
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