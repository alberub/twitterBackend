const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');

const { getUsuarios, getUsuarioById, crearUsuario, actualizarUsuario, borrarUsuario, validateRegistryData, getSubscribers, subscribers, getNotifications, updateNotification, pendingNotification } = require('../controllers/users');
const { validarJWT } = require('../middlewares/validar-jwt');

const router = Router();

router.get( '/', validarJWT, getUsuarios );

router.get( '/:id', validarJWT, getUsuarioById );

router.get('/:validate/:tipo', validarCampos, validateRegistryData );

router.get('/profile/pending/notifications', validarJWT, pendingNotification );

router.post('/notifications',
    [ 
        validarCampos,
        validarJWT 
    ], 
    getNotifications );

router.post( '/',       
    [
        check('firstName', 'El firstName es obligatorio').not().isEmpty(),
        check('username', 'El username es obligatorio').not().isEmpty(),
        check('email', 'El email es obligatorio').isEmail(),
        check('password', 'La contrasena es obligatoria').not().isEmpty(),        
        validarCampos,
    ],
    crearUsuario );

router.post('/subscribers', [ validarCampos,validarJWT ], getSubscribers );

router.put('/notif/update', 
    [        
        validarCampos,
        validarJWT
    ]
    , updateNotification )

router.put('/subscribers', 
    [
        validarJWT,        
        validarCampos

    ], subscribers );

router.put( '/:id', 
    [
        validarJWT,
        check('firstName', 'El nombre es obligatorio').not().isEmpty(),
        // check('bio', 'El nombre es obligatorio').not().isEmpty(),
        // check('location', 'El nombre es obligatorio').not().isEmpty(),
        // check('website', 'El nombre es obligatorio').not().isEmpty(),
        validarCampos,
    ],
    actualizarUsuario );

router.delete( '/:id', validarJWT, borrarUsuario );

module.exports = router;