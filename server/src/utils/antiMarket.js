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
    /\b(?:\+?237\s*)?6[25789]\d{1}[-.\s]?\d{2}[-.\s]?\d{2}[-.\s]?\d{2}\b/
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
