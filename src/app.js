import express from 'express';
import mongoose from 'mongoose';
import librosRouter from './routes/books.router.js';
import dotenv from 'dotenv';
import {engine} from 'express-handlebars';
import viewsRouter from './routes/views.router.js';

// Modulos
import connectMongoDB from './config/db.js';
import __dirname from '../dirname.js';
import { errorHandler } from './middlewares/error.midleware.js';


dotenv.config( { path: __dirname + '/.env' } );
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 8080;
app.use(express.static(__dirname + '/public'));


connectMongoDB();

// Handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/src/views'); 


// Endpoint para libros
app.use('/api/libros', librosRouter);
app.use('/', viewsRouter);




app.use(errorHandler);

app.listen(PORT, () => {
    console.log("Servidor escuchando en el puerto " + PORT);
});
