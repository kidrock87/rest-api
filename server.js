'use strict';

const Hapi = require('hapi');
const mongojs = require('mongojs');

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
    //host: 'localhost',
    host: '68.183.64.195',
    routes: { cors: true },
    port: 3000
});

//Connect to db
server.app.db = mongojs('crypto');

//Load plugins and start server
server.register([
    require('./routes/books')
], (err) => {

    if (err) {
        throw err;
    }

    // Start the server
    server.start((err) => {
        console.log('Server running at:', server.info.uri);
    });

});
