const mongoose = require('mongoose');
const { MONGO_URI } = require('./env');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000
        });
        console.log(`[DATABASE] MongoDB connecté avec succès : ${conn.connection.host}`);
    } catch (err) {
        console.error('[DATABASE ERROR] Échec de connexion à MongoDB :', err.message);
        // Ne pas crasher le processus immédiatement en dev, mais afficher l'erreur clairement
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    }
};

mongoose.connection.on('disconnected', () => {
    console.warn('[DATABASE WARNING] Connexion MongoDB perdue. Tentative de reconnexion...');
});

mongoose.connection.on('reconnected', () => {
    console.log('[DATABASE] MongoDB reconnecté avec succès.');
});

module.exports = connectDB;
