const express = require('express');
const storeRouter = require('./routes/store.routes');

const PORT = process.env.PORT || 5002;
const app = express();

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3002');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
});
app.use(express.json());
app.use('/api', storeRouter);

app.listen(PORT, function () {
  console.log(`server is running on port ${PORT}`);
});
