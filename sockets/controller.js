const { createMessages } = require("../controllers/chats");
const { comprobarJWT } = require("../helpers/jwt");
const Message = require("../models/message");
const ChatMensajes = require('../models/chat-mensajes');
const Chat = require("../models/chat");

const chatMensajes = new ChatMensajes();

const socketController = async(socket, io) => {
    

    const user = await comprobarJWT( socket.handshake.headers['x-token'] );

    if( !user ){
        return socket.disconnect();
    }
    
    chatMensajes.conectarUsuario( user );
    io.emit('usuarios-activos', chatMensajes.usersArr );
    // console.log(chatMensajes.usersArr,'Aui');
    // socket.emit('recibir-mensajes', chatMensajes.last10 );

    socket.join( user.id );


    socket.on('disconnect', () => {
        chatMensajes.desconectarUsuario( user.id );
        io.emit('usuarios-activos', chatMensajes.usersArr);
    });

    socket.on('enviar-mensaje', async({ uid, message, chatId }) => {

        // socket.join( user.id ).emit('mensaje-privado', { de:user.id, message, chatId });

        if ( uid ) {

            const newMessage = new Message({ from: user.id, message });

            const msg = await newMessage.save();
            
            const chat = await Chat.findById( chatId );

            chat.messages.push( msg._id );

            await Chat.findByIdAndUpdate( chatId, chat, { new: true } );

            socket.to( uid ).emit('mensaje-privado', { de:user.id, message, chatId, msg });
            io.to( user.id ).emit('myself', { de:user.id, message, chatId, msg });
            
        } else {

            chatMensajes.enviarMensaje( user.id, user.firstName, message);
            io.emit('recibir-mensajes', chatMensajes.last10 )
            
        }

    })

    socket.on('user-vote', ({  id, userVote, option, uid }) => {
        console.log(id, userVote, option, uid );
        socket.to( uid ).emit('new-vote', { voto: userVote, option, tweet: id, uid })
    })

}
module.exports = {
    socketController
}