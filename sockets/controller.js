const { comprobarJWT } = require("../helpers/jwt");
const Message = require("../models/message");
const Chat = require("../models/chat");
const Notify = require("../models/notification");

// const chatMensajes = new ChatMensajes();

const socketController = async(socket, io) => {

    const user = await comprobarJWT( socket.handshake.headers['x-token'] );    

    if( !user ){        
        console.log('no hay user');
        return socket.disconnect();
    }
    
    // chatMensajes.conectarUsuario( user );
    // io.emit('usuarios-activos', chatMensajes.usersArr );

    socket.join( user.id );


    socket.on('disconnect', () => {
        // chatMensajes.desconectarUsuario( user.id );
        // io.emit( 'usuarios-activos', chatMensajes.usersArr );        
    });

    socket.on('enviar-mensaje', async({ uid, message, chatId }) => {                
        if ( uid ) {            
            const newMessage = new Message({ from: user.id, message });
            const msg = await newMessage.save();        
            const chat = await Chat.findById( chatId );
            chat.messages.push( msg._id );
            await Chat.findByIdAndUpdate( chatId, chat, { new: true } );            
            socket.to( uid ).emit('mensaje-privado', { de:user.id, message, chatId, msg });
            io.to( user.id ).emit('myself', { de:user.id, message, chatId, msg });            
        } else {

            console.log('No hay uid en la peticion');
            // chatMensajes.enviarMensaje( user.id, user.firstName, message);
            // io.emit('recibir-mensajes', chatMensajes.last10 )
            
        }
    })    

    socket.on('my-reaction', async({ user, tweetOwner ,reaction, tweet }) => {                                           
        const existNotif = await Notify.findOne({ $and:[{ "userId": user },
                                                            { "reaction": reaction },
                                                            { "tweet": tweet._id }]})
                                
        if ( !existNotif ) {
            const notification = new Notify({ userId: user, tweetOwner ,reaction, tweet });
            notification.save();
            socket.to( tweetOwner._id ).emit('new-reaction', { user, reaction, tweet });
        }        
    })

    socket.on('user-vote', ({  id, userVote, option, uid }) => {        
        socket.to( uid ).emit('new-vote', { voto: userVote, option, tweet: id, uid })
    });

    // socket.on('notif', ( payload ) => {
    //     socket.to( uid ).emit('notif-user',  payload );
    // })

}
module.exports = {
    socketController
}