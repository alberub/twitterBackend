const { response } = require('express');
const User = require('../models/user');

const getFollows = async( req, res = response ) => {

    const id =  req.body.id;
    const data = req.body.data;

    if ( !id ) {
        return res.status(404).json({
            ok: false,
            msg:'No hay usuario en la peticion'
        })
    }

    try {

        const user = await User.findById( id );

        if ( data === 'followers' ) {

            const follows = await User.find({ '_id': {
                '$in': user.followers
              }});

            res.json({
              ok: true,
              follows
            });

        } else if( data === 'followings'){

            const follows = await User.find({ '_id': {
                '$in': user.followings
              }});

            res.json({
              ok: true,
              follows
            });
        }

        
    } catch (error) {
        res.status(404).json({
            ok: false,
            msg:'Error en la peticion'
        })
    }

}

const addFollow = async( req, res = response) => {

    const uid = req.uid;
    const follow = req.params.id;
    
    try {
    
        const usuarioAseguir = await User.findById( follow );
        const usuarioDB = await User.findById( uid );
    
        if( !usuarioDB ) {
            return res.status(404).json({
                ok:false,
                msg: 'No existe usuario con ese ID'
            });
        }

        if ( usuarioDB.followings.includes( follow )) {
            
            const findInMyFollowings = usuarioDB.followings.indexOf( follow );
            usuarioDB.followings.splice( findInMyFollowings, 1 );

            const find = usuarioAseguir.followers.indexOf( uid );
            usuarioAseguir.followers.splice( find, 1 );

            const miUsuarioActualizado = await User.findByIdAndUpdate( uid, usuarioDB, { new: true } );
            const usuarioAseguirActualizado = await User.findByIdAndUpdate( follow, usuarioAseguir, { new: true } );

            res.json({
                ok: false,
                miUsuarioActualizado,
                usuarioAseguirActualizado,
                msg:`You unfollowed @${ usuarioAseguirActualizado.username }`
            })

            
        } else {

            usuarioDB.followings.push( follow );
            usuarioAseguir.followers.push( uid );

            const miUsuarioActualizado = await User.findByIdAndUpdate( uid, usuarioDB, { new: true } );
            const usuarioAseguirActualizado = await User.findByIdAndUpdate( follow, usuarioAseguir, { new: true } );

            res.json({
                ok: true,
                miUsuarioActualizado,
                usuarioAseguirActualizado,
                msg:`You followed @${ usuarioAseguirActualizado.username }`
            })
            
         }
        
    } catch (error) {
        return res.status(500).json({
            ok: false,
            msg: 'Error inesperado'
        })
    }
    
    }


    module.exports = {
        addFollow,
        getFollows
    }