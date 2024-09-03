const express = require('express');
const body_parser = require('body-parser');
const userRouter = require('./routers/user.router');
const PropertyRouter = require('./routers/property.router');
const app = express();


app.use(body_parser.json());

app.use("/uploads",express.static("uploads"));
app.use('/',userRouter);
app.use('/',PropertyRouter);

module.exports = app;