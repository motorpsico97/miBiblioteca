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
            links.push({ 
                text: index, 
                link : `/?page=${index}&limit=${limit}`,
                active: index === librosData.page
            });
        };

        res.render("home",{libros, links, pagination: librosData});
    } catch (error) {
        next(error);
    }
});

// Ruta para la vista de detalle de un libro
viewsRouter.get('/libro/:id', async (req, res, next) => {
    try {
        const libro = await Libro.findById(req.params.id).lean();
        
        if (!libro) {
            return res.status(404).render('error', { 
                message: 'Libro no encontrado',
                layout: 'main'
            });
        }
        
        res.render('book-detail', { libro });
    } catch (error) {
        next(error);
    }
});

export default viewsRouter; 