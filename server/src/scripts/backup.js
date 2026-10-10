/**
 * Script de sauvegarde automatique de la base de données (JSON dump)
 * Sauvegarde les collections dans un dossier d'archives local daté.
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { MONGO_URI } = require('../config/env');
const User = require('../models/User');
const Request = require('../models/Request');
const Message = require('../models/Message');

const backupDatabase = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = path.resolve(__dirname, `../../backups/backup-${timestamp}`);

        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        console.log(`📦 Début de la sauvegarde dans : ${backupDir}`);

        const [users, requests, messages] = await Promise.all([
            User.find({}).lean(),
            Request.find({}).lean(),
            Message.find({}).lean()
        ]);

        fs.writeFileSync(path.join(backupDir, 'users.json'), JSON.stringify(users, null, 2));
        fs.writeFileSync(path.join(backupDir, 'requests.json'), JSON.stringify(requests, null, 2));
        fs.writeFileSync(path.join(backupDir, 'messages.json'), JSON.stringify(messages, null, 2));

        console.log(`✅ Sauvegarde réussie :`);
        console.log(`   - ${users.length} utilisateurs`);
        console.log(`   - ${requests.length} demandes`);
        console.log(`   - ${messages.length} messages`);
        console.log(`📁 Fichiers enregistrés dans : ${backupDir}`);

    } catch (err) {
        console.error('❌ Erreur lors de la sauvegarde :', err.message);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

backupDatabase();
