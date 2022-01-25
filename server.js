const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const errorhandler = require('errorhandler');
const morgan = require('morgan');

app.use(express.json());

const apiRouter = require('./api/api.js');


app.use(cors());
app.use(errorhandler());
app.use(morgan('dev'));

app.use('/api', apiRouter);

const port = process.env.port || 4000;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
})

module.exports = app;