const { response } = require('express');
const Hospital = require('../models/hospital');

const getHospitales = async(req, res = response ) => {

    const hospitales = await Hospital.find()
                                    .populate('usuario', 'nombre img')

    res.json({
        ok:true,
        hospitales
    });
}

const crearHospitales = async(req, res = response ) => {

    const uid = req.uid;
    const hospital = new Hospital( { usuario:uid, ...req.body});
    
    try {

        const hospitalDB = await hospital.save();

        res.json({
            ok:true,
            hospital: hospitalDB
        });
        
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg:'Error, contacte al administrador - crearHospital'
        })    
    }
}

const actualizarHospitales = (req, res) => {
    res.json({
        ok:true,
        msg:'put hospitales'
    });
}

const borarHospitales = (req, res) => {
    res.json({
        ok:true,
        msg:'delete hospitales'
    });
}


module.exports = {
    getHospitales,
    crearHospitales,
    actualizarHospitales,
    borarHospitales
}