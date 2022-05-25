const bcrypt = require('bcryptjs');
const { response } = require('express');
const { generarJWT } = require('../helpers/jwt');
const User = require('../models/user');
const Data = require('../models/data');

const getUsuarios = async( req, res = response ) => {

    const desde = Number(req.query.desde) || 0;

    const [ usuarios,total ] = await Promise.all([

        User.find({}, 'firstName lastName username followers email img')
                                  .skip( desde )
                                  .limit( 5 ),
        User.countDocuments()

    ]);

        res.json({
            ok: true,
            usuarios,
            total
        });
}

const getUsuarioById = async( req, res = response ) => {

    const id = req.params.id;
    
    try {

        const userName = await User.find({ 'username': id });

        const user = userName[0];
    
            res.json(
                user
                )
        
    } catch (error) {

        res.status(500).json({
            ok: false,
            msg:'Ha habido un error, revisar logs'
        })
        
    }

}

const crearUsuario = async( req, res = response ) => {

    const { email, password, username } = req.body;

    try {

        const existeEmail = await User.findOne({ email });

        if( existeEmail) {
            return res.status(400).json({
                ok: false,
                msg: 'El correo ya se encuentra registrado'
            })
        }

        const existeUserName = await User.findOne({ username });

        // const existeUserName = await User.find( username );
        // const existeUserName = await User.find({ 'username':{
        //                                         $regex: '/[a-z][A-Z]/'
        //                                       }});

        if ( existeUserName ) {
                
            return res.status(400).json({
                ok: false,
                msg: 'El nombre de usuario no se encuentra disponible'
            })
                                
        }        

        const user = new User( req.body );

        // Encriptar contasena ====

        const salt = bcrypt.genSaltSync();
        user.password = bcrypt.hashSync( password, salt );

        // Guardar usuario =====

        await user.save();

        const data = new Data({ userId:user, ...req.body });

        await data.save();

        const token = await generarJWT( user.id );

        res.json({
            ok: true,
            user,
            token,
            data
        });
        
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg:'Error inesperado, revisar logs'
        })
    }

}

const actualizarUsuario = async( req, res = response) => {

const uid = req.params.id;

try {

    const usuarioDB = await User.findById( uid );

    if( !usuarioDB ) {
        return res.status(404).json({
            ok:false,
            msg: 'No existe usuario con ese ID'
        });
    }

    const { followers, password, email, ...campos} = req.body;

    // if ( usuarioDB.email !== email ) {

        // const existeEmail = await User.findOne({ email });
        
        // if( existeEmail ) {
            // return res.status(400).json({
                // ok: false,
                // msg: 'Ya existe un usuario registrado con ese email'
            // });
        // } else {
            // campos.email = email;
        // }
    // }    

    const usuarioActualizado = await User.findByIdAndUpdate( uid, campos, { new: true} );

    res.json({
        ok: true,
        user: usuarioActualizado
    })


    
} catch (error) {
    
    res.status(500).json({
        ok: false,
        msg: 'Error inesperado'
    })
}

}

const borrarUsuario = async( req, res = response ) => {

    const uid = req.params.id;

    try {

        const usuarioDB = await User.findById( uid );

            if( !usuarioDB ) {
                return res.status(404).json({
                    ok:false,
                    msg: 'No existe usuario con ese ID'
                });
            }

        await User.findByIdAndDelete( uid );

        res.json({
            ok:true,
            msg:'Usuario ha sido eliminado'
        });
        
    } catch (error) {
        
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado'
        })
    }

}

module.exports = {
    getUsuarios,
    getUsuarioById,
    crearUsuario,
    actualizarUsuario,
    borrarUsuario
};