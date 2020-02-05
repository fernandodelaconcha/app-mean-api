'use strict'
var mongoose = require('mongoose');
var app = require('./app')
var port = process.env.port || 3977

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/app-mean', (err, res) => {
    if (err){
        throw err;
    } else {
        console.log('db running OK');
        app.listen(port, () => {
            console.log(`server listening in port ${port}`)
        })
    }
});