const { response } = require('express');
const Chat = require('../models/chat');
const Message = require('../models/message');

const newChat = async( req, res = response ) => {

    const uid = req.uid;
    const id  = req.body.id;

    try {
        
        // const newChat = new Chat();
            
        const chatExists = await Chat.find({ 
            $and: [ { "members": id },{ "members": uid } ] 
        });

        if ( chatExists[0] ) {

            const chat = await Chat.findById( chatExists[0]._id )
                                   .populate( 'members', 'img firstName lastName username createdAt followers followings' )
                                   .populate( 'messages', 'message from createdAt' );

            return res.json({
                exists: chat
            });
            
        } else if ( !chatExists[0] ) {
                        
            const newChat = new Chat({ members: uid, ...req.body });
            newChat.members.push( id );
            await newChat.save();

            const chat = await Chat.findById( newChat._id )
                                   .populate( 'members', 'img firstName lastName username createdAt followers followings' )
                                   .populate( 'messages', 'message from createdAt' );


            return res.json({
                ok: true,
                chat
            })
            
        }
        

    } catch (error) {

        res.json({
            ok:false,
            msg:'Error newChat'
        })
            
    }   

}

const createMessages = async( req, res = response ) => {

    const chatId = req.params.id;
    const uid = req.uid;
    const { message } = req.body;
    
    try {

        const newMessage = new Message({ from: uid, message});
        
        const msg = await newMessage.save();

        const chat = await Chat.findById( chatId );

        chat.messages.push( msg._id );

        const chatUpdated = await Chat.findByIdAndUpdate( chatId, chat, { new: true });

        res.json({
            chat: chatUpdated
        })
        
    } catch (error) {
        res.json({
            ok: false,
            msg:'Error server nm'
        })
    }

}

const getChats = async( req, res = response ) => {

    const uid = req.uid;

    try {

        const chats = await Chat.find({ "members": uid })
                                    .populate( 'members', 'img firstName lastName username createdAt followers followings' )
                                    .populate( 'messages', 'message from createdAt' );

        res.json({
            chats
        })


        
    } catch (error) {
        res.json({
            ok:false,
            mag:'Error en server'
        })
    }

}

const getMessages = async( req, res = response ) => {

    const chatId = req.params.id;

    const { getMessages } = req.body;

    try {

    const messages = await Message.find({
        "_id" : {
          "$in" : 
          getMessages
         }
      })
      .sort({ createdAt: -1 })
      .skip( 0 )
      .limit(10) 

    res.json({
        ok: true,
        messages 
    })

        
    } catch (error) {

        res.json({
            ok:false,
            msg:'Error en server'
        })
        
    }

}

module.exports = {
    newChat,
    createMessages,
    getChats,
    getMessages
}


// if ( !uid ) {
    //     return res.status(404).json({
    //         ok: false,
    //         mag:'new chat error'
    //     })
    // }