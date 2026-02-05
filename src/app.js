import express from 'express';
import mongoose from 'mongoose';
import librosRouter from './routes/books.router.js';
import dotenv from 'dotenv';
import {engine} from 'express-handlebars';
import viewsRouter from './routes/views.router.js';
import adminRouter from './routes/admin.router.js';
import session from 'express-session';

// Modulos
import connectMongoDB from './config/db.js';
import __dirname from '../dirname.js';
import { errorHandler } from './middlewares/error.midleware.js';


dotenv.config( { path: __dirname + '/.env' } );
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 8080;
app.use(express.static(__dirname + '/public'));


connectMongoDB();

// Configuracion de sesiones
app.use(session({
    secret: process.env.SESSION_SECRET || 'secreto-por-defecto',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true
    }
}));

// Handlebars
app.engine('handlebars', engine({
    helpers: {
        eq: (a, b) => a === b
    }
}));
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/src/views'); 


// Endpoint para libros
app.use('/api/libros', librosRouter);
app.use('/admin', adminRouter);
app.use('/', viewsRouter);




app.use(errorHandler);

app.listen(PORT, () => {
    console.log("Servidor escuchando en el puerto " + PORT);
});
