const path = require('path');
const fs = require('fs');

const User = require('../models/user');
const Tweet = require('../models/post');
const res = require('express/lib/response');

const cloudinary = require('cloudinary').v2
cloudinary.config( process.env.CLOUDINARY_URL ); 

const { response } = require('express');
const { v4: uuidv4 } = require('uuid');

const { actualizarImagen } = require('../helpers/actualizar-imagen');

const fileUpload = ( req, res = response ) => {

    const tipo = req.params.tipo;
    const id = req.params.id;

    const tiposValidos = ['usersP', 'users', 'tweets'];

    if( !tiposValidos.includes(tipo)){
        return res.status(400).json({
            ok:false,
            msg:'No es un medico, usuario u hospital (tipo)'
        });
    }

    // Validacion de archivo existente

    if( !req.files || Object.keys( req.files ).length === 0) {
        return res.status(400).json({
            ok:false,
            msg:'No hay ningun archivo'
        });
    }

    // Procesar el archivo

    const file = req.files.imagen;

    const nombreCortado = file.name.split('.');
    const extensionArchivo = nombreCortado [ nombreCortado.length -1];

    // Validar extension

    const extensionValida = ['gif','png', 'jpg', 'jpeg', 'webp'];

    if( !extensionValida.includes( extensionArchivo) ){
        return res.status(400).json({
            ok: false,
            msg:'No es una extension valida'
        });
    }

    // Generar el nombre del archivo

    const nombreArchivo = `${ uuidv4() }.${ extensionArchivo }`;

    // Path para guardar imagen

    const path = `./uploads/${ tipo }/${ nombreArchivo }`;

    // Use the mv() method to place the file somewhere on your server
    file.mv( path, (err) => {
      if (err){
            return res.status(500).json({
                ok: false,
                msg:'Error al mover la imagen'
            });
        }

        // Actualizar base de datos

        actualizarImagen( tipo, id, nombreArchivo);



      
        res.json({
            ok: true,
            msg:'Archivo subido correctamente',
            nombreArchivo
        });

    });    

}

const fileUploadCloudinary = async( req, res = response ) => {

    const tipo = req.params.tipo;
    const id = req.params.id;

    const tiposValidos = ['usersP', 'users', 'tweets'];

    if( !tiposValidos.includes(tipo)){
        return res.status(400).json({
            ok:false,
            errorMessage:'invalid type'
        });
    }

    // Validacion de archivo existente

    if( !req.files || Object.keys( req.files ).length === 0) {
        return res.status(400).json({
            ok:false,
            msg:'No hay ningun archivo'
        });
    }

    // Procesar el archivo

    const file = req.files.imagen;
                                      
    const nombreCortado = file.name.split('.');                         
    const extensionArchivo = nombreCortado [ nombreCortado.length -1];  

    // Validar extension

    const extensionValida = ['gif','png', 'jpg', 'jpeg', 'webp'];

    if( !extensionValida.includes( extensionArchivo) ){
        return res.status(400).json({
            ok: false,
            msg:'No es una extension valida'
        });
    }

    // Generar el nombre del archivo

    // const nombreArchivo = `${ uuidv4() }.${ extensionArchivo }`;    ********

    // Path para guardar imagen

    // const path = `./uploads/${ tipo }/${ nombreArchivo }`;          ********

    // Use the mv() method to place the file somewhere on your server

    // file.mv( path, (err) => {                            **********
    //   if (err){                                          **********
    //         return res.status(500).json({                **********
    //             ok: false,                               **********
    //             msg:'Error al mover la imagen'           **********
    //         });
    //     }

        // Actualizar base de datos

        //===== ESTO REALIZABA LA ACTUALIZACION DIRECTA EN EL SERVIDOR Y LA ALMACENABA EN EL MISMO =======


        const { tempFilePath } = req.files.imagen;

        // const nombreArchivo = actualizarImagen( tipo, id, tempFilePath );

        let nombreArchivo;

        switch ( tipo ) {

            case 'tweets':
    
                    const tweet = await Tweet.findById(id);
                    if( !tweet ) {
                        return false;
                    }
    
                    if ( tweet.img ) {
                        const nameArr = tweet.img.split('/');
                        const name = nameArr[ nameArr.length -1 ];
                        const [ public_id ] = name.split('.');
                        cloudinary.uploader.destroy( public_id );
                    }
    
                    var { secure_url } = await cloudinary.uploader.upload( tempFilePath );
    
                    tweet.img = secure_url;
                    await tweet.save();
                    res.json({
                        ok: true,
                        msg:'Archivo subido correctamente',
                        nombreArchivo: secure_url
                    });
                    return;
            
                break;
    
            case 'users':
    
                    const user = await User.findById(id);
                    if( !user ) {
                        return false;
                    }
    
                    if ( user.img ) {
                        const nameArr = user.img.split('/');
                        const name = nameArr[ nameArr.length -1 ];
                        const [ public_id ] = name.split('.');
                        cloudinary.uploader.destroy( public_id );
                    }
    
                    var { secure_url } = await cloudinary.uploader.upload( tempFilePath );
    
                    user.img = secure_url;
                    await user.save();
                    res.json({
                        ok: true,
                        msg:'Archivo subido correctamente',
                        nombreArchivo: secure_url
                    });
                    return;
            
                break;
    
            case 'usersP':
    
                    const userPort = await User.findById(id);
                    if( !userPort ) {
                        return res.status(400).json({
                            msg:'No existe id en los parametros'
                        });
                    }
    
                    if ( userPort.imgPort ) {
                        const nameArr = userPort.imgPort.split('/');
                        const name = nameArr[ nameArr.length -1 ];
                        const [ public_id ] = name.split('.');
                        cloudinary.uploader.destroy( public_id );
                    }
    
                    var { secure_url } = await cloudinary.uploader.upload( tempFilePath );
    
                    userPort.imgPort = secure_url;
                    await userPort.save();
                    res.json({
                        ok: true,
                        msg:'Archivo subido correctamente',
                        nombreArchivo: secure_url
                    });
                    return;
            
                break;
    
                default:
                    return res.status(400).json({
                        ok: false,
                        errorMessage: 'ha ocurrido un error',
                    });
        
        }

}

// const retornaImagen = ( req, res = response ) => {

//     const tipo = req.params.tipo;
//     const foto = req.params.foto;

//     const pathImg = path.join( __dirname, `../uploads/${ tipo }/${ foto }` );

//     if( fs.existsSync( pathImg)) {
//         res.sendFile( pathImg );
//     } else {
//         const pathImg = path.join( __dirname, `../uploads/no-image.png` );
//         res.sendFile( pathImg );
//     }

// }

const retornaImagen = ( req, res = response ) => {

    const tipo = req.params.tipo;
    const foto = req.params.foto;

    // const pathImg = path.join( __dirname, `../uploads/${ tipo }/${ foto }` );
    const pathImg = path.join( __dirname, `../uploads/no-image.jpg` );

    if( pathImg ) {
        res.sendFile( pathImg );
    } 

}

module.exports = {
    fileUpload,
    fileUploadCloudinary,
    retornaImagen
}

