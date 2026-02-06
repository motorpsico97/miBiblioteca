import express from 'express';
import Libro from '../models/book.model.js';

const viewsRouter = express.Router();

// Ruta para la vista principal de libros
viewsRouter.get('/', async (req, res, next) => {
    try {

        const {limit = 20, page = 1, search = '', categoria = '', genero = '', autor = ''} = req.query;
        
        // Obtener todas las categorías y géneros únicos
        const allCategorias = await Libro.distinct('categoria');
        const allGeneros = await Libro.distinct('genero');
        
        // Construir query de búsqueda
        let query = {};
        const conditions = [];
        
        if (search && search.trim() !== '') {
            // Buscar en múltiples campos
            const searchRegex = new RegExp(search, 'i');
            conditions.push({
                $or: [
                    { titulo: searchRegex },
                    { autor: searchRegex },
                    { editorial: searchRegex },
                    { categoria: searchRegex },
                    { genero: searchRegex },
                    { estado: searchRegex },
                    { resumen: searchRegex }
                ]
            });
        }

        // Filtro por categoría
        if (categoria && categoria.trim() !== '') {
            conditions.push({ categoria: categoria });
        }

        // Filtro por género
        if (genero && genero.trim() !== '') {
            conditions.push({ genero: genero });
        }

        // Filtro por autor
        if (autor && autor.trim() !== '') {
            conditions.push({ autor: autor });
        }

        // Combinar condiciones
        if (conditions.length > 0) {
            query = conditions.length === 1 ? conditions[0] : { $and: conditions };
        }

        const librosData = await Libro.paginate(query, { limit, page, lean: true });
        const libros = librosData.docs;
        delete librosData.docs;

        const links = [];

        for(let index = 1; index <= librosData.totalPages; index++){
            const params = new URLSearchParams();
            params.set('page', index);
            params.set('limit', limit);
            if (search) params.set('search', search);
            if (categoria) params.set('categoria', categoria);
            if (genero) params.set('genero', genero);
            if (autor) params.set('autor', autor);
            
            links.push({ 
                text: index, 
                link : `/?${params.toString()}`,
                active: index === librosData.page
            });
        };

        res.render("home",{
            libros, 
            links, 
            pagination: librosData, 
            search, 
            categoria, 
            genero,
            autor,
            allCategorias: allCategorias.sort(),
            allGeneros: allGeneros.sort()
        });
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