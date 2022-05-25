const { Router } = require('express');
const expressFileUpload = require('express-fileupload');

const { fileUpload, retornaImagen, fileUploadCloudinary } = require('../controllers/uploads');

const { validarJWT } = require('../middlewares/validar-jwt')

const router = Router();

router.use( expressFileUpload({
    useTempFiles : true,
    tempFileDir: '/tmp/'
}));

router.put('/:tipo/:id',validarJWT, fileUploadCloudinary );

router.get('/:tipo/:foto', retornaImagen );

module.exports = router;