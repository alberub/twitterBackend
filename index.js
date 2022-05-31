const express = require('express');
require( 'dotenv' ).config();

const path = require('path');
const cors = require('cors');

const { dbConnection } = require('./database/config');
const { socketController } = require('./sockets/controller')

const app = express();
const server = require('http').createServer( app );

const io = require('socket.io')(server,{
    cors:{
        origin: true,
        credentials: true
    }
});

app.use( cors() );

app.use( express.json() );

dbConnection();

// Directorio publico

app.use(express.static('public')); 

app.use( '/api/users', require('./routes/users') );

app.use( '/api/tweets', require('./routes/tweets') );

app.use( '/api/chats', require('./routes/chats') );

app.use( '/api/followings', require('./routes/followings') )

app.use( '/api/login', require('./routes/auth') );

app.use( '/api/search', require('./routes/busqueda') );

app.use( '/api/upload', require('./routes/uploads') );

app.get( '*', ( req, res ) => {
    res.sendFile( path.resolve(__dirname, './public/index.html') )
});

// function sockets(){

    io.on('connection', ( socket ) => socketController( socket, io))
    
// }


server.listen( process.env.PORT, () => {
    console.log('Servidor ( server - socket io ) corriendo en puerto' + process.env.PORT);
});