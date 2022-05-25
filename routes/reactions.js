const { Router } = require('express');
const { check } = require('express-validator');
const { } = require('../controllers/data');
const { validarJWT, profilePrivacy } = require('../middlewares/validar-jwt');
const { validarCampos } = require('../middlewares/validar-campos');

const router = Router();

router.get( '/:id', 
    [
        validarJWT,
        profilePrivacy
    ] 
    ,getTweets );

router.post( '/', 
    [
        validarJWT,
        check('message', 'Debe ingresar un mensaje').not().isEmpty(),
        validarCampos
    ]
    ,createTweet );

router.put( '/:id', 
    [
        validarJWT,
        check('message', ' El mensaje es obligatorio').not().isEmpty(),
        check('usuario', 'El user id debe ser valido').isMongoId(),
        validarCampos
    ] 
    ,updateTweet );

router.delete( '/:id', validarJWT );

router.get( '/:id', validarJWT );

module.exports = router;