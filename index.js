const express = require('express');
require('dotenv').config();

const gatesRouter = require('./routes/gates.routes');
const ordersRouter = require('./routes/orders.routes');
const placesRouter = require('./routes/places.routes');
const loginRouter = require('./routes/login.routes')

const PORT = process.env.PORT;
const app = express();

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
});
app.use(express.json());
app.use('/api/gates', gatesRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/places', placesRouter);
app.use('/login', loginRouter);

app.listen(PORT, function () {
  console.log(`server is running on port ${PORT}`);
});
