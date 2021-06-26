const path = require('path');
const fs = require('fs');

const { response } = require('express');
const { v4: uuidv4 } = require('uuid');
const { actualizarImagen } = require('../helpers/actualizar-imagen');

const fileUpload = ( req, res = response ) => {

    const tipo = req.params.tipo;
    const id   = req.params.id;

    const tiposValidos = ['hospitales', 'medicos', 'usuarios'];

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

    const extensionValida = ['png', 'jpg', 'jpeg', 'gif'];

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

const retornaImagen = ( req, res = response ) => {

    const tipo = req.params.tipo;
    const foto = req.params.foto;

    const pathImg = path.join( __dirname, `../uploads/${ tipo }/${ foto }` );

    if( fs.existsSync( pathImg)) {
        res.sendFile( pathImg );
    } else {
        const pathImg = path.join( __dirname, `../uploads/no-imagen.jpg` );
        res.sendFile( pathImg );
    }

    

}

module.exports = {
    fileUpload,
    retornaImagen
}

