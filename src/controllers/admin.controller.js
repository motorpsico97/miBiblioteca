import Libro from '../models/book.model.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mostrar formulario de login
export const showLoginForm = (req, res) => {
    if (req.session.isAdmin) {
        return res.redirect('/admin/dashboard');
    }
    res.render('admin/login', { layout: 'admin' });
};

// Procesar login
export const login = (req, res) => {
    const { username, password } = req.body;
    
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        req.session.isAdmin = true;
        req.session.username = username;
        return res.redirect('/admin/dashboard');
    }
    
    res.render('admin/login', { 
        layout: 'admin',
        error: 'Usuario o contraseña incorrectos' 
    });
};

// Procesar logout
export const logout = (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
};

// Mostrar dashboard con lista de libros
export const showDashboard = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        
        const librosData = await Libro.paginate({}, { 
            page, 
            limit, 
            lean: true,
            sort: { createdAt: -1 }
        });
        
        res.render('admin/dashboard', { 
            layout: 'admin',
            libros: librosData.docs,
            pagination: {
                page: librosData.page,
                totalPages: librosData.totalPages,
                hasNextPage: librosData.hasNextPage,
                hasPrevPage: librosData.hasPrevPage,
                nextPage: librosData.nextPage,
                prevPage: librosData.prevPage,
                totalDocs: librosData.totalDocs
            },
            success: req.query.success
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al cargar los libros');
    }
};

// Mostrar formulario de nuevo libro
export const showCreateForm = (req, res) => {
    res.render('admin/book-form', { 
        layout: 'admin',
        title: 'Agregar Nuevo Libro',
        action: '/admin/books/create'
    });
};

// Crear nuevo libro
export const createBook = async (req, res) => {
    try {
        const libroData = req.body;
        
        // Si se subió una imagen, usar la ruta del archivo
        if (req.file) {
            libroData.portada = '/img/' + req.file.filename;
        }
        
        // Convertir categorias de string a array
        if (typeof libroData.categoria === 'string') {
            libroData.categoria = libroData.categoria.split(',').map(cat => cat.trim());
        }
        // Convertir generos de string a array
        if (typeof libroData.genero === 'string') {
            libroData.genero = libroData.genero.split(',').map(gen => gen.trim());
        }
        
        const nuevoLibro = new Libro(libroData);
        await nuevoLibro.save();
        
        res.redirect('/admin/dashboard?success=Libro creado exitosamente');
    } catch (error) {
        console.error(error);
        res.render('admin/book-form', { 
            layout: 'admin',
            title: 'Agregar Nuevo Libro',
            action: '/admin/books/create',
            error: 'Error al crear el libro: ' + error.message,
            libro: req.body
        });
    }
};

// Mostrar formulario de edición
export const showEditForm = async (req, res) => {
    try {
        const libro = await Libro.findById(req.params.id).lean();
        
        if (!libro) {
            return res.status(404).send('Libro no encontrado');
        }
        
        // Convertir arrays a strings para el formulario
        if (Array.isArray(libro.categoria)) {
            libro.categoriaString = libro.categoria.join(', ');
        }
        if (Array.isArray(libro.genero)) {
            libro.generoString = libro.genero.join(', ');
        }
        
        res.render('admin/book-form', { 
            layout: 'admin',
            title: 'Editar Libro',
            action: `/admin/books/edit/${libro._id}`,
            libro,
            isEdit: true
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al cargar el libro');
    }
};

// Actualizar libro
export const updateBook = async (req, res) => {
    try {
        const libroData = req.body;
        
        // Si se subió una nueva imagen, eliminar la anterior y usar la nueva
        if (req.file) {
            // Obtener el libro actual para eliminar la imagen anterior
            const libroActual = await Libro.findById(req.params.id);
            if (libroActual && libroActual.portada && libroActual.portada.startsWith('/img/')) {
                const imagePath = path.join(__dirname, '../../public', libroActual.portada);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }
            libroData.portada = '/img/' + req.file.filename;
        }
        
        // Convertir categorias de string a array
        if (typeof libroData.categoria === 'string') {
            libroData.categoria = libroData.categoria.split(',').map(cat => cat.trim());
        }
        // Convertir generos de string a array
        if (typeof libroData.genero === 'string') {
            libroData.genero = libroData.genero.split(',').map(gen => gen.trim());
        }
        
        await Libro.findByIdAndUpdate(req.params.id, libroData, { 
            new: true, 
            runValidators: true 
        });
        
        res.redirect('/admin/dashboard?success=Libro actualizado exitosamente');
    } catch (error) {
        console.error(error);
        res.render('admin/book-form', { 
            layout: 'admin',
            title: 'Editar Libro',
            action: `/admin/books/edit/${req.params.id}`,
            error: 'Error al actualizar el libro: ' + error.message,
            libro: req.body,
            isEdit: true
        });
    }
};

// Eliminar libro
export const deleteBook = async (req, res) => {
    try {
        // Obtener el libro antes de eliminarlo para acceder a la ruta de la imagen
        const libro = await Libro.findById(req.params.id);
        
        if (!libro) {
            return res.redirect('/admin/dashboard?error=Libro no encontrado');
        }
        
        // Si el libro tiene una imagen en /public/img, eliminarla
        if (libro.portada && libro.portada.startsWith('/img/')) {
            const imagePath = path.join(__dirname, '../../public', libro.portada);
            
            // Verificar si el archivo existe antes de eliminarlo
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        
        // Eliminar el libro de la base de datos
        await Libro.findByIdAndDelete(req.params.id);
        
        res.redirect('/admin/dashboard?success=Libro eliminado exitosamente');
    } catch (error) {
        console.error(error);
        res.redirect('/admin/dashboard?error=Error al eliminar el libro');
    }
};
