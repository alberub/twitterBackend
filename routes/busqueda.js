const { Router } = require('express');
const { getTodo, getColeccion } =require('../controllers/busqueda');
const { validarJWT } = require('../middlewares/validar-jwt')

const router = Router();

router.get('/:busqueda', validarJWT, getTodo );

// router.get('/coleccion/:tabla/:busqueda', validarJWT, getColeccion );

module.exports = router;