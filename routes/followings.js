const { Router } = require('express');
const { validarCampos } = require('../middlewares/validar-campos');

const { addFollow, getFollows } = require('../controllers/followings');
const { validarJWT } = require('../middlewares/validar-jwt');

const router = Router();

router.post('/:id', 
    [
        validarJWT,
        validarCampos
    ], 
    addFollow );

router.post('/',
    [
        validarJWT,
        validarCampos
    ],
    getFollows );

module.exports = router;