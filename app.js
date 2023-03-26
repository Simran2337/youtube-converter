const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require('dotenv').config();

const app = express();

if (process.env.ENVIRONMENT) {
	app.use(logger('dev'));
}
app.use(require('cors')());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', require('./routes/index'));

app.get('*', (req, res) => {
	res.status(404).json({ message: 'This Resource Doesn\'t Exist' })
});

module.exports = app;
