import e from 'express';
import mongoose from 'mongoose';

const connectMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);     
        console.log("Conectado a MongoDB");   
    } catch (error) {
        console.error("Error al conectar a MongoDB:", error);
        process.exit(1);
    }
};


export default connectMongoDB;