'use strict'
var express = require('express');
var bodyParser = require('body-parser');

const app = express();

//load routes
var user_routes = require('./routes/user');
var artist_routes = require('./routes/artist');
var album_routes = require('./routes/album');
var song_routes = require('./routes/song');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//http headers

app.use((req, res, next)=> {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    
    //Handle Preflight 

    if (req.method === 'OPTIONS') {
        res.status(200).send();        
    }
    else {
        next();
    }

})

// base routes
app.use('/api', user_routes);
app.use('/api', artist_routes);
app.use('/api', album_routes);
app.use('/api', song_routes);

module.exports = app;