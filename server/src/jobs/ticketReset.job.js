const User = require('../models/User');
const { TICKETS } = require('../config/constants');

/**
 * Job périodique robuste pour la régénération des tickets d'aide
 * S'exécute à intervalles réguliers et vérifie la date réelle 'lastReset'
 * en base de données pour résister aux redémarrages serveur.
 */
class TicketResetJob {
    static async execute() {
        try {
            const septJoursAvant = new Date(Date.now() - TICKETS.RELOAD_INTERVAL_DAYS * 24 * 60 * 60 * 1000);

            const result = await User.updateMany(
                {
                    requestsLeft: { $lt: TICKETS.DEFAULT_QUOTA },
                    lastReset: { $lte: septJoursAvant }
                },
                {
                    $set: {
                        requestsLeft: TICKETS.DEFAULT_QUOTA,
                        lastReset: new Date()
                    }
                }
            );

            if (result.modifiedCount > 0) {
                console.log(`[JOB TICKETS] Quota rechargé pour ${result.modifiedCount} utilisateur(s).`);
            }
        } catch (err) {
            console.error('[JOB TICKETS ERROR] Échec du rechargement périodique :', err.message);
        }
    }

    static start(intervalMs = 60 * 60 * 1000) { // Vérification toutes les heures
        console.log('[JOB TICKETS] Service de surveillance des quotas initialisé.');
        // Exécution immédiate au démarrage
        this.execute();
        // Vérification récurrente
        setInterval(() => this.execute(), intervalMs);
    }
}

module.exports = TicketResetJob;
