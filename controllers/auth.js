const { response } = require( 'express');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { generarJWT } = require('../helpers/jwt');

const login = async( req, res = response ) => {

    const { email, password } = req.body;

    try {

            // Verificar email

            const usuarioDB = await User.findOne({email});

            if( !usuarioDB ) {
                return res.status(404).json({
                    ok: false,
                    msg:'Incorrect password'
                });
            }

            // Verificar contrasena

            const validPassword = bcrypt.compareSync( password, usuarioDB.password );
            if( !validPassword ){
                return res.status(400).json({
                    ok: false,
                    msg: 'Incorrect password'
                });
            }
            
            // Generar JWT

            const token = await generarJWT( usuarioDB.id );

            res.json({
                ok: true,                
                token        
            });
        
        } catch (error) {                        
            response.status(500).json({                
                ok:false,
                errorMessage:'Error inesperado, hable con el administrador'
            });
        }

}

const renewToken = async( req, res = response ) => {

    const uid = req.uid;

    // Generar JWT

    const token = await generarJWT( uid );

    const usuario = await User.findById(uid);

    res.json({
        ok: true,
        token,
        usuario
    });

}


module.exports = {
    login,
    renewToken
}