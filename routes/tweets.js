const { Router } = require('express');
const { check } = require('express-validator');
const { addBookmark ,createTweet, createReply, updateTweet, deleteTweet, getTweetById, getTweets, getData, getFollowingTweets, getReplies, retweet, updatePoll, getBookmark } = require('../controllers/tweets');
const { validarJWT, profilePrivacy } = require('../middlewares/validar-jwt');
const { validarCampos } = require('../middlewares/validar-campos');

const router = Router();


router.post( '/getTweets', 
    [
        validarJWT,
        validarCampos
    ] 
    ,getTweets );

router.get( '/:id/:tipo', 
    [
        validarJWT,
        validarCampos
    ] 
    ,getData );

router.get( '/bookmark', 
    [
        validarJWT,
        validarCampos
    ] 
    ,getBookmark );

router.post('/getReplies', 
    [
        validarJWT,
        validarCampos
    ]
    , getReplies )

router.post( '/getTweet', validarJWT, getFollowingTweets);

router.post( '/bookmark/:id', 
    [
        validarJWT,
        validarCampos
    ]
    ,addBookmark );

router.post( '/', 
    [
        validarJWT,
        check('message', 'Debe ingresar un mensaje').not().isEmpty(),
        validarCampos
    ]
    ,createTweet );

router.post( '/reply', 
    [
        validarJWT,
        check('message', 'Debe ingresar un mensaje').not().isEmpty(),
        check('id', 'Debe ser un tweet id valido').isMongoId(),
        validarCampos
    ]
    ,createReply );

router.put( '/', 
    [
        validarJWT,
        validarCampos
    ] 
    ,updateTweet );

router.put('/poll', 
    [

        validarJWT,
        check('id', 'El tweet id debe ser valido').isMongoId(),
        // check('userVote', 'Debe ser un id de usuario').not().isEmpty().isMongoId(),        
        check('option', 'Debe seleccionar una opcion').isIn( ['option1','option2']),    
        validarCampos

    ]
    , updatePoll)

router.put('/retweet/:id',
    [
        validarJWT,
        validarCampos
    ]
    , retweet),

router.delete( '/:id', validarJWT ,deleteTweet );

router.get( '/:id/status/:idt', validarJWT , getTweetById );

module.exports = router;