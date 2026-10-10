/**
 * Moteur de calcul mathématique de réputation et anti-collusion
 */
const { REPUTATION } = require('../config/constants');

/**
 * Calcule le score de réputation pondéré
 * @param {Object} metric Métrique de compétence de l'utilisateur
 * @returns {number} Score arrondi à 1 décimale (sur 5.0)
 */
function calculerScorePondere(metric) {
    const helpCount = metric.helpCount || 1;
    const acceptedCount = metric.acceptedCount || 1;
    const totalStars = metric.totalStars || 5;
    const uniqueHelped = metric.uniqueUsersHelped ? metric.uniqueUsersHelped.length : 1;

    // 1. Facteur Pédagogie (Moyenne des étoiles reçues)
    const notePedagogie = totalStars / helpCount;

    // 2. Facteur Sérieux (Ratio sessions complétées / sessions acceptées)
    const noteSerieux = Math.min(1.0, helpCount / acceptedCount);

    // 3. Facteur Partage (Diversité des apprenants aidés, plafonnée à 5)
    const notePartage = Math.min(5.0, (uniqueHelped / helpCount) * 5.0);

    // Formule pondérée à 3 facteurs
    const scoreBrut = 
        (notePedagogie * REPUTATION.WEIGHT_PEDAGOGY) + 
        ((noteSerieux * 5.0) * REPUTATION.WEIGHT_SERIOUSNESS) + 
        (notePartage * REPUTATION.WEIGHT_SHARING);

    return Math.min(REPUTATION.MAX_SCORE, Math.max(0, Math.round(scoreBrut * 10) / 10));
}

module.exports = {
    calculerScorePondere
};
