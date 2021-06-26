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

const actualizarMedicos = (req, res) => {
    res.json({
        ok:true,
        msg:'put medicos'
    });
}

const borrarMedicos = (req, res) => {
    res.json({
        ok:true,
        msg:'delete medicos'
    });
}


module.exports = {
    getMedicos,
    crearMedicos,
    actualizarMedicos,
    borrarMedicos
}