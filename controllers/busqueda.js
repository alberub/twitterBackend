const { response } = require('express');
const User = require('../models/user');

const getTodo = async( req, res = response ) => {

    const busqueda = req.params.busqueda;
    const regex = new RegExp( busqueda, 'i'); 

    try {

        const desde = Number(req.query.desde) || 0;                                                               
        const users = await User.find({ 'firstName': regex })
                                .skip( desde )
                                .limit( 5 );
    
        res.json({
            users: users 
        })
        
    } catch (error) {
        
        return res.status(500).json({
            ok:false,
            msg:'Ha ocurrido un error'
        })

    }

}

// const getColeccion = async( req, res = response ) => {

//     const tabla = req.params.tabla;
//     const busqueda = req.params.busqueda;
//     const regex = new RegExp( busqueda, 'i'); 

//     let data = [];

//     switch (tabla) {
//         case 'medicos':
            
//             data = await Medico.find({ nombre: regex })
//                                .populate( 'usuario', 'nombre img' )
//                                .populate( 'hospital', 'nombre img' );

//             break;

//         case 'hospitales':

//             data = await Hospital.find({ nombre: regex })
//                                  .populate('usuario', 'nombre img');
        
//             break;

//         case 'usuarios':

//             data = await Usuario.find({ nombre: regex });

            
//             break;
    
//         default:
//             return res.status(400).json({
//                 ok: false,
//                 msg: 'La tabla tiene que ser medicos/ hospitales/ usuarios'
//             });
//     }

//     res.json({
//         ok: true,
//         resultado: data
//     })

// }

module.exports = {
    getTodo
    // getColeccion
}