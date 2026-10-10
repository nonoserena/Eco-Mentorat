const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { PORT, CLIENT_URL } = require('./config/env');
const SocketManager = require('./sockets/socketManager');
const TicketResetJob = require('./jobs/ticketReset.job');

const startServer = async () => {
    // 1. Connexion Base de Données
    await connectDB();

    // 2. Création du serveur HTTP
    const server = http.createServer(app);

    // 3. Initialisation de la couche WebSockets
    const socketManager = new SocketManager(server, {
        origin: CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
    });

    // Rendre le socketManager accessible dans les contrôleurs Express
    app.set('socketManager', socketManager);

    // 4. Démarrage des tâches de fond (Jobs)
    TicketResetJob.start();

    // 5. Écoute réseau
    server.listen(PORT, () => {
        console.log(`====================================================`);
        console.log(`🚀 [SERVEUR] Éco-Mentorat API Enterprise`);
        console.log(`🌐 Port d'écoute : ${PORT}`);
        console.log(`🛡️  Sécurité OWASP, Sockets & Jobs opérationnels`);
        console.log(`====================================================`);
    });

    // 6. Gestion de l'arrêt gracieux (Graceful Shutdown)
    const gracefulShutdown = (signal) => {
        console.log(`\n[SIGNAL] ${signal} reçu. Fermeture gracieuse en cours...`);
        server.close(async () => {
            console.log('[SERVEUR] Connexions HTTP fermées.');
            const mongoose = require('mongoose');
            await mongoose.connection.close(false);
            console.log('[DATABASE] Déconnexion MongoDB effectuée.');
            process.exit(0);
        });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
};

startServer().catch(err => {
    console.error('[FATAL SERVER ERROR] Échec du lancement :', err);
    process.exit(1);
});
