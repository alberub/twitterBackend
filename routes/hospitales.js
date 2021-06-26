const { Router } = require('express');
const { check } = require('express-validator');
const { getHospitales, crearHospitales, actualizarHospitales, borarHospitales } = require('../controllers/hospitales');
const { validarJWT } = require('../middlewares/validar-jwt');
const { validarCampos } = require('../middlewares/validar-campos');

const router = Router();

router.get( '/', getHospitales );

router.post( '/',
    [
        validarJWT,
        check('nombre', 'El nombre del hospital es obligatorio').not().isEmpty(),
        validarCampos
    ],
    crearHospitales );

router.put( '/:id', actualizarHospitales );

router.delete( '/:id', borarHospitales );

module.exports = router;