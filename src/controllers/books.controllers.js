import Libro from "../models/book.model.js";
import { throwHttpError } from "../utils/http.error.js";

// Obtener todos los libros
export const getAllBooks = async (req, res, next) => {
    try {
        // Lógica para obtener todos los libros
        const { limit = 20, page = 1 } = req.query;
        const librosData = await Libro.paginate({}, { limit, page, lean: true });
        const libros = librosData.docs;
        delete librosData.docs;

        res.status(200).json({ status: 'success', payload: libros, ...librosData });
    } catch (error) {
        next(error);
    }
};

// Crear un nuevo libro

export const createBook = async (req, res, next) => {
    try {
        // Crear un nuevo libro utilizando el modelo de Mongoose
        const nuevoLibro = await Libro.create(req.body);

        res.status(201).json({ status: 'success', payload: nuevoLibro });
    } catch (error) {
        next(error);
    }
};

// Actualizar un libro existente
export const updateBook = async (req, res, next) => {
    try {
        const lid = req.params.id;
        const datosActualizados = req.body;

        const libroActualizado = await Libro.findByIdAndUpdate(lid, datosActualizados, { new: true, runValidators: true });

        if (!libroActualizado) throwHttpError('Libro no encontrado', 404);
/*         if (!libroActualizado) return res.status(404).json({ status: 'error', message: 'Libro no encontrado' });
 */        res.status(200).json({ status: 'success', payload: libroActualizado });

    } catch (error) {
        next(error);
    }
};

// Eliminar un libro
export const deleteBook = async (req, res, next) => {
    try {
        const lid = req.params.id;
        const libroEliminado = await Libro.findByIdAndDelete(lid);

        if (!libroEliminado) throwHttpError('Libro no encontrado', 404);
        /* if (!libroEliminado) return res.status(404).json({status: 'error', message: 'Libro no encontrado'}); */
        res.status(200).json({status: 'success', payload: libroEliminado});

    } catch (error) {
        next(error);
    }
};