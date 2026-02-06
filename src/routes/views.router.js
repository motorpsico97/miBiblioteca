import express from 'express';
import Libro from '../models/book.model.js';

const viewsRouter = express.Router();

// Ruta para la vista principal de libros
viewsRouter.get('/', async (req, res, next) => {
    try {

        const {limit = 20, page = 1, search = '', autor = '', sort = ''} = req.query;
        
        // Convertir filtros a arrays (solo categoría y género permiten múltiples)
        let categorias = req.query.categoria ? (Array.isArray(req.query.categoria) ? req.query.categoria : [req.query.categoria]) : [];
        let generos = req.query.genero ? (Array.isArray(req.query.genero) ? req.query.genero : [req.query.genero]) : [];
        
        // Obtener todas las categorías y géneros únicos
        const allCategorias = await Libro.distinct('categoria');
        const allGeneros = await Libro.distinct('genero');
        
        // Construir query de búsqueda
        let query = {};
        const conditions = [];
        
        // Configurar ordenamiento
        let sortOptions = {};
        if (sort === 'az') {
            sortOptions = { titulo: 1 };
        } else if (sort === 'za') {
            sortOptions = { titulo: -1 };
        } else {
            sortOptions = { createdAt: -1 };
        }
        
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

        // Filtro por categoría (múltiples selecciones con AND - debe tener TODAS las categorías)
        if (categorias.length > 0) {
            conditions.push({ categoria: { $all: categorias } });
        }

        // Filtro por género (múltiples selecciones con AND - debe tener TODOS los géneros)
        if (generos.length > 0) {
            conditions.push({ genero: { $all: generos } });
        }

        // Filtro por autor (selección única)
        if (autor && autor.trim() !== '') {
            conditions.push({ autor: autor });
        }

        // Combinar condiciones
        if (conditions.length > 0) {
            query = conditions.length === 1 ? conditions[0] : { $and: conditions };
        }

        const librosData = await Libro.paginate(query, { limit, page, lean: true, sort: sortOptions });
        const libros = librosData.docs;
        delete librosData.docs;

        const links = [];

        for(let index = 1; index <= librosData.totalPages; index++){
            const params = new URLSearchParams();
            params.set('page', index);
            params.set('limit', limit);
            if (search) params.set('search', search);
            categorias.forEach(c => params.append('categoria', c));
            generos.forEach(g => params.append('genero', g));
            if (autor) params.set('autor', autor);
            if (sort) params.set('sort', sort);
            
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
            categorias,
            generos,
            autor,
            limit,
            sort,
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