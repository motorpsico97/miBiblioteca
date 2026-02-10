/* product.model.js */
import paginate from 'mongoose-paginate-v2';
import mongoose from 'mongoose';

const boocksSchema = new mongoose.Schema(
    {
        portada: {
            type: String,
            required: true,
            default: 'default_cover.jpg'
        },
        titulo: {
            type: String,
            required: true,
            minLength: 3,
            maxLength: 300
        },
        autor: {
            type: String,
            required: true,
            minLength: 3,
            maxLength: 100
        },
        ISBN: {
            type: Number,
            minLength: 5,
            maxLength: 20
        },
        paginas: {
            type: Number,
            required: true,
            min: 1,
            max: 10000
        },
        editorial: {
            type: String,
            required: true,
            minLength: 3,
            maxLength: 150
        },
        year: {
            type: Number,
            min: 1000,
            max: new Date().getFullYear() + 1
        },
        categoria: {
            type: [String],
            required: true,
            validate: {
                validator: function(v) {
                    return v.length <= 4;
                },
                message: 'El libro no puede tener más de 4 categorías'
            }
        },
        genero: {
            type: [String],
            required: true,
            validate: {
                validator: function(v) {
                    return v.length <= 7;
                },
                message: 'El libro no puede tener más de 7 géneros'
            }
        },
        resumen:{
            type: String,
            minLength: 0,
            maxLength: 10000,
        },
        estado: {
            type: String,
            enum: ['pendiente lectura', 'leyendo', 'finalizado'],
            default: 'pendiente lectura'
        }
    },
    { timestamps: true }
);

// Indices
boocksSchema.index({ autor: 'text', editorial: 'text', categoria: 'text', genero: 'text' });

// Paginación
boocksSchema.plugin(paginate);


const Libro = mongoose.model('Libro', boocksSchema);
export default Libro;
