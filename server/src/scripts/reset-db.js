/**
 * Script de remise à zéro complète (Base Blanche) de la base de données Éco-Mentorat.
 * Supprime tous les utilisateurs, toutes les demandes et tous les messages de chat,
 * puis recrée proprement les index Mongoose.
 */

const mongoose = require('mongoose');
const { MONGO_URI } = require('../config/env');
const User = require('../models/User');
const Request = require('../models/Request');
const Message = require('../models/Message');

const resetDatabase = async () => {
    try {
        console.log(`🔄 Connexion à MongoDB (${MONGO_URI})...`);
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connecté à MongoDB.');

        const [userCount, reqCount, msgCount] = await Promise.all([
            User.countDocuments(),
            Request.countDocuments(),
            Message.countDocuments()
        ]);
        console.log(`📊 État avant nettoyage : ${userCount} utilisateurs, ${reqCount} demandes, ${msgCount} messages.`);

        console.log('🧹 Suppression de toutes les collections (utilisateurs, demandes, chats)...');
        await Promise.all([
            User.deleteMany({}),
            Request.deleteMany({}),
            Message.deleteMany({})
        ]);

        console.log('🔧 Synchronisation des index...');
        await Promise.all([
            User.syncIndexes(),
            Request.syncIndexes(),
            Message.syncIndexes()
        ]);

        console.log('✨ Base de données 100 % vierge (en blanc) et prête pour tes tests en local !');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur lors de la remise à zéro :', error.message);
        process.exit(1);
    }
};

resetDatabase();
