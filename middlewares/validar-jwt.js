const jwt = require('jsonwebtoken');
const usuario = require('../models/usuario');

const validarJWT = ( req, res, next ) => {

    const token = req.header('x-token');

     if (!token){
         return res.status(401).json({
             ok: false,
             msg:'No hat token en la peticion'
         });
     }

     try {

        const { uid } = jwt.verify( token, process.env.JWT_SECRET );

        req.uid = uid;

        next();
         
     } catch (error) {

        return res.status(401).json({
            ok:false,
            msg:'Token invalido'
        });
         
     }

};

const validarAdminRole = async( req, res, next) => {

    const uid = req.uid;

    try {

        const usuarioDB =  await usuario.findById( uid );

        if( !usuarioDB ){
            return res.status(404).json({
                ok:false,
                msg:'Usuario no existe'
            });
        }

        if( usuarioDB.role !== 'admin_role') {
            return res.status(403).json({
                ok:false,
                msg:'No tiene privilegios de administrador'
            });
        }

        next();
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg:'Hable con el administrador'
        })
    } 

}

const validarAdminRole_O_mismoUsuario = async( req, res, next) => {

    const uid = req.uid;
    const id = req.params.id;

    try {

        const usuarioDB =  await usuario.findById( uid );

        if( !usuarioDB ){
            return res.status(404).json({
                ok:false,
                msg:'Usuario no existe'
            });
        }

        if( usuarioDB.role === 'admin_role' || uid === id ) {
             next();
        } else {

            return res.status(403).json({
                ok:false,
                msg:'No tiene privilegios de administrador'
            });

        }
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg:'Hable con el administrador'
        })
    } 

}

module.exports = {
    validarJWT,
    validarAdminRole,
    validarAdminRole_O_mismoUsuario
};