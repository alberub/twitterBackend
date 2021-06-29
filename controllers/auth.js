const { response } = require( 'express');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuario');
const { generarJWT } = require('../helpers/jwt');
const { googleVerify } = require('../helpers/google.verify');

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

const googleSignIn = async( req, res = response ) => {

    const googleToken = req.body.token;

    try {

        const { name, email, picture } = await googleVerify( googleToken );

        // Verificar si existe usuario con mismo email

        const usuarioDB = await Usuario.findOne({ email });
        let usuario;

        if( !usuarioDB ){
            usuario = new Usuario({
                nombre: name,
                email,
                password:'@@@',
                img: picture,
                google: true
            })
        } else {

            // Existe el usuario
            usuario = usuarioDB;
            usuario.google = true;

        }

        //  Guardar en la base de datos

        await usuario.save();

        // Generar JWT

        const token = await generarJWT( usuario.id );
        
        res.json({
            ok: true, 
            token
        });

    } catch (error) {

        res.status(401).json({
            ok: false, 
            msg: 'Token no es correcto'
        });
        
    }

    

} 

module.exports = {
    login,
    googleSignIn
}