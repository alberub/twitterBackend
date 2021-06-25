const { response } = require( 'express');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuario');
const { generarJWT } = require('../helpers/jwt');

const login = async( req, res = response ) => {

    const { email, password } = req.body;

    try {

        // Verificar email

        const usuarioDB = await Usuario.findOne({email});

        if(!usuarioDB) {
            return res.status(404).json({
                ok: false,
                msg:'El usuario y/o contrasena no coinciden'
            })
        }

        // Verificar contrasena

        const validPassword = bcrypt.compareSync( password, usuarioDB.password );
        if( !validPassword ){
            return res.status(400).json({
                ok: false,
                msg: 'Contrasena no valida'
            });
        }
        
        // Generar JWT

        const token = await generarJWT( usuarioDB.id );

        res.json({
            ok: true,
            token
        });
        
    } catch (error) {
        console.log(error);
        response.status(500).json({
            ok:false,
            msg:'Error inesperado, hable con el administrador'
        })
    }

}

module.exports = {
    login
}