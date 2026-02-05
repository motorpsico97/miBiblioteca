import express from 'express';
import Libro from '../models/book.model.js';

const viewsRouter = express.Router();

// Ruta para la vista principal de libros
viewsRouter.get('/', async (req, res, next) => {
    try {

        const {limit = 20, page = 1} = req.query;

        const librosData = await Libro.paginate({}, { limit, page, lean: true });
        const libros = librosData.docs;
        delete librosData.docs;

        const links = [];

        for(let index = 1; index <= librosData.totalPages; index++){
            links.push({ text: index, link : `/?page=${index}&limit=${limit}` });
        };

        res.render("home",{libros, links, pagination: librosData});
    } catch (error) {
        next(error);
    }
});

export default viewsRouter; 