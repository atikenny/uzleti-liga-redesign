const https     = require('https');
const fs        = require('fs');
const express   = require('express');
const app       = express();

const options = {
    key: fs.readFileSync('app/cert/localhost.key'),
    cert: fs.readFileSync('app/cert/localhost.crt'),
    requestCert: false,
    rejectUnauthorized: false
};

https.createServer(options, app).listen(3000);

app.use(express.static('build'));
