const express = require('express');
const gatesRouter = require('./routes/gates.routes');
const ordersRouter = require('./routes/orders.routes');
const placesRouter = require('./routes/places.routes');

const PORT = process.env.PORT || 5002;
const app = express();

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3002');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
});
app.use(express.json());
app.use('/api/gates', gatesRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/places', placesRouter);

app.listen(PORT, function () {
  console.log(`server is running on port ${PORT}`);
});
