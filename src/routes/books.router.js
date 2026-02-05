import express from 'express';

import { getAllBooks, createBook, updateBook, deleteBook } from '../controllers/books.controllers.js';

const librosRouter = express.Router();


// Ruta para obtener todos los libros
librosRouter.get('/', getAllBooks);

// Crear un nuevo libro
librosRouter.post('/', createBook);
    

// Actualizar un libro existente
librosRouter.put('/:id', updateBook);

// Eliminar un libro
librosRouter.delete('/:id', deleteBook);

export default librosRouter;
