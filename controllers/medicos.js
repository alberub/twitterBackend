const { response } = require('express');
const Medico = require('../models/medico');

const getMedicos = async(req, res = response ) => {

    const medicos = await Medico.find()
                                    .populate('usuario', 'nombre img')
                                    .populate('hospital', 'nombre img')

    res.json({
        ok:true,
        medicos
    });
}

const crearMedicos = async(req, res = response ) => {

    const uid = req.uid;
    const medico = new Medico({ usuario:uid, ...req.body })

    try {

        const medicoDB = await medico.save();

        res.json({
            ok:true,
            medico: medicoDB
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg:'Error, hable con el administrador - crear medico'
        })
    }

}

const actualizarMedicos = async(req, res) => {

    const id = req.params.id;
    const uid = req.uid;

    try {

        const medico = await Medico.findById( id );

        if( !medico ){

            return res.status(404).json({
                ok:true,
                msg:'Medico no encontrado'
            });
            
        }

        
        const cambiosMedico = {
            ...req.body,
            usuario: uid
        }

        const medicoActualizado = await Medico.findByIdAndUpdate( id, cambiosMedico, { new: true });

        res.json({
            ok:true,
            medico: medicoActualizado
        });
        
    } catch (error) {

        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador - medico'
        })
        
    }

    
}

const borrarMedicos = async(req, res) => {
    
    const id = req.params.id;

    try {

        const medico = await Medico.findById( id );

        if( !medico ){

            return res.status(404).json({
                ok:true,
                msg:'Medico no encontrado'
            });
            
        }

        
        await Medico.findByIdAndDelete(id);

        res.json({
            ok:true,
            msg:'Medico eliminado'
        });
        
    } catch (error) {

        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador - medico'
        })
        
    }

}

const getMedicoById = async(req, res = response ) => {

    const id = req.params.id;

    try {

    const medico = await Medico.findById( id )
                                .populate('usuario', 'nombre img')
                                .populate('hospital', 'nombre img')

    res.json({
        ok:true,
        medico
    });
        
    } catch (error) {
        res.json({
            ok:false,
            msg: 'Hable con el administrador'
        })
    }

    
}


module.exports = {
    getMedicos,
    crearMedicos,
    actualizarMedicos,
    borrarMedicos,
    getMedicoById
}