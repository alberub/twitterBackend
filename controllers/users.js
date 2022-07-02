const bcrypt = require('bcryptjs');
const { response } = require('express');
const { generarJWT } = require('../helpers/jwt');
const User = require('../models/user');
const Data = require('../models/data');
const Notify = require('../models/notification');

const getUsuarios = async( req, res = response ) => {

    const desde = Number(req.query.desde) || 0;

    try{

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

    } catch (error) {
        res.status(500).json({
            ok: false,
            errorMessage: 'Error server'
        })
    }

}

const getUsuarioById = async( req, res = response ) => {

    const id = req.params.id;
    
    try {

        const user = await User.findOne({ 'username': id });        
    
            res.json( user )
        
    } catch (error) {
        res.status(500).json({
            ok: false,
            errorMessage: 'Error server'
        })
    }

}

const validateRegistryData = async( req, res = response ) => {

    const validate = req.params.validate;
    const tipo = req.params.tipo;

    try {

        switch (tipo) {

            case 'username':
                
                const findForUsername = await User.find({ "username": validate });
                const username = findForUsername[0];                
                
                if ( username ) {
                    res.json({
                        ok: true                        
                    })

                } else {
                    res.json({
                        ok: false                        
                    })
                }
                
            break;

            case 'email':

                const findForEmail = await User.find({ "email": validate });
                const email =  findForEmail[0];
                
                if ( email ) {
                    res.json({
                        ok: true                        
                    })
                } else {
                    res.json({
                        ok: false                        
                    })
                }
            break;
        
            default:
                return res.status(400).json({
                    ok: false,
                    msg: 'Error, not found type'
                });
        }
        
    } catch (error) {
        res.status(500).json({
            ok: false,
            errorMessage: 'Error server'
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
                    msg: 'That email is already being used.'
                })
            }

            const existeUserName = await User.findOne({ username });

            if ( existeUserName ) {
                    
                return res.status(400).json({
                    ok: false,
                    msg: 'Username is not available'
                })
                                    
            }        

            const user = new User( req.body );

            // Encriptar contasena ====

            const salt = bcrypt.genSaltSync();
            user.password = bcrypt.hashSync( password, salt );

            // Guardar usuario =====

            await user.save();

            const data = new Data({ userId: user });

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
                errorMessage: 'Error server'
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
                msg: 'User error'
            });
        }

        const { followers, password, email, ...campos} = req.body; 

        const usuarioActualizado = await User.findByIdAndUpdate( uid, campos, { new: true} );

        res.json({
            ok: true,
            user: usuarioActualizado
        })


    
    } catch (error) {
        res.status(500).json({
            ok: false,
            errorMessage: 'Error server'
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
                    msg: 'User does not exist'
                });
            }

        await User.findByIdAndDelete( uid );

        res.json({
            ok:true,
            tweet: usuarioDB,
            msg:'User has been deleted'
        });
        
    } catch (error) {
        res.status(500).json({
            ok: false,
            errorMessage: 'Error server'
        })
    }

}

const getSubscribers = async( req, res ) => {

    const uid = req.uid;    
    
    try {

        const found = await Data.find({ "userId": uid });
        const foundData = found[0]

        if ( !foundData ) {
            res.status(404).json({
                ok: false,
                mag: 'data not found'
            })
        }

        res.json({
            ok: true,
            foundData     
        })

        
    } catch (error) {
        res.status(500).json({
            ok: false,
            errorMessage: 'Error server'
        })
    }

}

const subscribers = async( req, res = response ) => {
    
    const uid = req.uid;
    const { subscriber } = req.body;    

    try {            

        const found = await Data.findOne({ "userId": uid });      
        const subscriberFound = await User.findById( subscriber );

        if ( !found || !subscriberFound ){
            res.status(404).json({
                ok: false,
                msg:'Not found'
            });
        } 
        
        if ( found.subscribers.includes( subscriber )) {

            const foundSubscriber = found.subscribers.indexOf( subscriber );
            found.subscribers.splice( foundSubscriber, 1);
            const user = await Data.findByIdAndUpdate( found._id, found, { new: true} );
            res.json({
                ok: true,
                user
            })        

        } else {
            
            found.subscribers.push( subscriber );
            const user = await Data.findByIdAndUpdate( found._id, found, { new: true} );            
            res.json({
                ok: true,
                user
            })
        }        
        
    } catch (error) {
        res.status(500).json({
            ok: false,
            errorMessage: 'Error server'
        })
    }

}

const getNotifications = async( req, res = response ) => {

    const uid = req.uid;
    const { id } = req.body;

    if ( uid !== id ) {
        return;
    }

    try {

        const notif = await Notify.find({ "tweetOwner": uid })
                                  .populate('userId', 'firstName lastName username img followers followings imgPort')        
                                  .populate('tweet');
        if ( !notif ) {
            res.json({
                ok: false,
                errorMessage:'The user does not exist'
            })
        }

        res.json({
            ok: true,
            notif
        })
        
    } catch (error) {
        res.status(500).json({
            ok: false,
            errorMessage:'Server error'
        })
    }

}

const updateNotification = async( req, res = response ) => {
    
    const uid = req.uid;    

    try {

        await Notify.updateMany({ $and:[{ "viewed": false }, { "tweetOwner": uid }]}, { $set: { "viewed": true }});    

        res.json({
            ok: true                  
        })
        
    } catch (error) {
        res.status(500).json({
            ok: false,
            errorMessage:'Server error'
        })
    }

}

const pendingNotification = async( req, res = response ) => {
    
    const uid = req.uid;    

    try {
        
        const notifications = await Notify.find({ $and:[{ "viewed": false }, { "tweetOwner": uid } ]});

        res.json({
            ok: true,
            notifications
        })
        
    } catch (error) {
        res.status(500).json({
            ok: false,
            errorMessage:'Server error'
        })
    }

}

// const showWhoToFollow = async( req, res = response ) => {

//     const uid = req.uid;

// }

// const subscriberFound = await User.findById( subscriber );
        // if ( !found ){
        //     res.status(404).json({
        //         ok: false,
        //         msg:'Not found'
        //     });
        // } 

module.exports = {
    getUsuarios,
    getUsuarioById,
    validateRegistryData,
    crearUsuario,
    actualizarUsuario,
    borrarUsuario,
    subscribers,
    getSubscribers,
    getNotifications,
    updateNotification,
    pendingNotification
};