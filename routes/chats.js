const { Router } = require('express');
const { check } = require('express-validator');
const { newChat, createMessages, getChats, getMessages, markAsSeen, unreadChat } = require('../controllers/chats');
const { validarJWT } = require('../middlewares/validar-jwt');
const { validarCampos } = require('../middlewares/validar-campos');

const router = Router();


router.post( '/newChat', 
    [
        validarJWT,
        check('id', 'Debe ser un ID valido').isMongoId(),
        validarCampos
    ] 
    ,newChat );

router.post('/newMessage/:id',
    [
        validarJWT,
        check('message', 'El mensaje debe tener una longitud minima').not().isEmpty(),
        validarCampos
    ]
    ,createMessages
    );

router.get('/getChats', 
    [
        validarJWT,
        validarCampos
    ]
    ,getChats
    );

router.post('/getMessages/:id',
    [
        validarJWT,
        validarCampos
    ]
    ,getMessages
    );

router.put( '/updateChat/:chatId/:messageId',
    [
        validarJWT,
        validarCampos
    ]
    , markAsSeen
    );

router.put( '/unreadChat/:chatId',
    [
        validarJWT,
        validarCampos
    ]
    , unreadChat
    );

module.exports = router;