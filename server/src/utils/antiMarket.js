/**
 * Filtre Anti-Marché, Anti-Vente et Anti-Monétisation Professionnel
 * Conçu avec frontières de mots (\b) pour bloquer les annonces commerciales,
 * ventes d'articles (chaussures, habits, téléphones...) et transactions financières
 * sans faux positifs sur les sujets académiques (ex: "économie", "marketing", "sommaire").
 */

const PATTERNS_INTERDITS = [
    // Mobile Money & Moyens de paiement
    /\b(?:orange\s*money|momo|mtn\s*money|wave|paypal|western\s*union)\b/i,
    // Variations spécifiques d'acronymes avec délimiteurs stricts
    /(?:^|\s|\W)(?:om|m-o-m-o|o-m|o\.m)(?:\s|\W|$)/i,
    // Devises et transactions
    /\b(?:fcfa|cfa|francs?|euros?|dollars?)\b/i,
    /\b\d+\s*(?:k|fcfa|frs|cfa|€|\$)\b/i,
    // Termes d'échange financier explicite
    /\b(?:payer|payement|paiement|rémunération|remuneration|dépôt|depot|tarifs?|combien\s*tu\s*prends)\b/i,
    // Annonces commerciales, vente et achat de biens/services (FR & EN)
    /\b(?:vendeurs?|vendeuses?|vendre|vends|vente|acheteurs?|acheter|achète|achete|boutiques?|magasins?|friperies?|grossistes?|livraisons?)\b/i,
    /\b(?:chaussures?|habits?|vêtements?|vetements?|pantalons?|robes?|sacs?|mèches?|meches?|perruques?|montres?|parfums?|cosmétiques?)\b/i,
    /\b(?:for\s*sale|seller|selling|buy\s*now|cheap\s*price|shop\s*online|shoes?\s*seller)\b/i,
    // Argot transactionnel camerounais / étudiant
    /\b(?:verse\s*moi|envoie\s*le\s*crédit|fais\s*un\s*dépôt|gombo|tchoko|motivation\s*financière)\b/i,
    // Tentative de déviation vers WhatsApp / Téléphone (numéros camerounais 9 chiffres : 6xx... ou internationaux)
    /\b(?:whatsapp|telegram|contacte[zr]?\s*moi\s*au)\b/i,
    /\b(?:\+?237\s*)?6[25789]\d{1}[-.\s]?\d{2}[-.\s]?\d{2}[-.\s]?\d{2}\b/,
    // Paiement en échange d'un service (FR : paye/payer/payé ; EN : pay you / I'll pay)
    /\b(?:je\s+(?:te|vous)\s+pay\w*|(?:tu|vous)\s+(?:vas|allez)\s+être\s+pay\w*|pay\w*\s+(?:toi|moi))\b/i,
    /\b(?:i['’]?ll|i\s+will|i\s+can|i\s+would|let\s+me)\s+pay\b|\bpay\s+(?:you|me)\b|\bi['’]?ll\s+give\s+you\s+\d+/i,
    /\b(?:argent|money|cash|salary|salaire)\b/i,
    // Triche : faire les exercices / devoirs à la place de l'étudiant
    /\b(?:fais|fait|faire|traite|traiter|résous|resous|résoudre|do|solve|complete|finish)\s+(?:tous\s+|toutes\s+|all\s+|every\s+)?(?:mes|my)\s+(?:exercices?|devoirs?|exercises?|homework|assignments?|examens?|exams?|tp|projets?|projects?)\b/i,
    /\b(?:à\s+ma\s+place|in\s+my\s+place|instead\s+of\s+me)\b/i
];

/**
 * Vérifie si le texte contient une tentative de transaction, d'annonce commerciale ou de détournement
 * @param {string} texte 
 * @returns {boolean}
 */
function contientContenuInterdit(texte) {
    if (!texte || typeof texte !== 'string') return false;
    const cleanText = texte.trim();
    return PATTERNS_INTERDITS.some(regex => regex.test(cleanText));
}

module.exports = {
    contientContenuInterdit,
    PATTERNS_INTERDITS
};
