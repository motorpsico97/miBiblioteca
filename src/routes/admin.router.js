import express from 'express';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import upload from '../config/multer.js';
import {
    showLoginForm,
    login,
    logout,
    showDashboard,
    showCreateForm,
    createBook,
    showEditForm,
    updateBook,
    deleteBook
} from '../controllers/admin.controller.js';

const adminRouter = express.Router();

// Rutas públicas
adminRouter.get('/login', showLoginForm);
adminRouter.post('/login', login);

// Rutas protegidas
adminRouter.get('/logout', isAuthenticated, logout);
adminRouter.get('/dashboard', isAuthenticated, showDashboard);
adminRouter.get('/books/create', isAuthenticated, showCreateForm);
adminRouter.post('/books/create', isAuthenticated, upload.single('portada'), createBook);
adminRouter.get('/books/edit/:id', isAuthenticated, showEditForm);
adminRouter.post('/books/edit/:id', isAuthenticated, upload.single('portada'), updateBook);
adminRouter.post('/books/delete/:id', isAuthenticated, deleteBook);

export default adminRouter;
