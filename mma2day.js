'use strict';

const Hapi = require('hapi');
const mongojs = require('mongojs');

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
    //host: '188.226.197.80',
    host: 'localhost',
	  routes: { cors: true },
    port: 7777
});

//Connect to db
server.app.db = mongojs('mma2day');

//Load plugins and start server
server.register([
    require('./routes/mma2day')
], (err) => {

    if (err) {
        throw err;
    }

    // Start the server
    server.start((err) => {
        console.log('Server running at:', server.info.uri);
    });

});
