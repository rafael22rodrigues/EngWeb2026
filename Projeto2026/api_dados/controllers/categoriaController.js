const Categoria = require('../models/categoria');

const categoriaController = {
    createCategoria: async (req, res) => {
        try {
            const newCategoria = new Categoria(req.body);
            await newCategoria.save();
            res.status(201).json(newCategoria);
        } catch (error) {
            res.status(400).json({message: error.message})
        }
    },
    getAllCategorias: async (req, res) => {
        try {
            const categorias = await Categoria.find();
            res.json(categorias);
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    },
    deleteCategoria: async (req, res) => {
        try {
            const categoria = await Categoria.findByIdAndDelete(req.params.id);
            if (!categoria) {
                return res.status(404).json({message: 'Categoria not found'})
            }
            else {
                res.json({message: 'Categoria deleted successfully'});
            }
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    }
}

module.exports = categoriaController;

