'use strict';

const Hapi = require('hapi');
const mongojs = require('mongojs');

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
    host: 'localhost',
    routes: { cors: true },
    port: 3001
});

//Connect to db
server.app.db = mongojs('fastr');

//Load plugins and start server
server.register([
    require('./routes/fastr')
], (err) => {

    if (err) {
        throw err;
    }

    // Start the server
    server.start((err) => {
        console.log('Server running at:', server.info.uri);
    });

});
