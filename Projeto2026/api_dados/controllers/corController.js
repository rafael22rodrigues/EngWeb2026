const Cor = require('../models/cor');

const corController = {
    createCor: async (req, res) => {
        try {
            const newCor = new Cor(req.body);
            await newCor.save();
            res.status(201).json(newCor);
        } catch (error) {
            res.status(400).json({message: error.message})
        }
    },
    getAllCores: async (req, res) => {
        try {
            const cores = await Cor.find();
            res.json(cores);
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    },
    deleteCor: async (req, res) => {
        try {
            const cor = await Cor.findByIdAndDelete(req.params.id);
            if (!cor) {
                return res.status(404).json({message: 'Cor not found'})
            }
            else {
                res.json({message: 'Cor deleted successfully'});
            }
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    }
}

module.exports = corController;