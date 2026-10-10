/**
 * Filtre Anti-Marché et Anti-Monétisation Professionnel
 * Conçu avec frontières de mots et détection d'obfuscation
 * pour éliminer les faux positifs (ex: "sommaire", "économie", "nom").
 */

// Expressions régulières avec limites de mots (\b) pour éviter les faux positifs
const PATTERNS_INTERDITS = [
    // Mobile Money & Moyens de paiement
    /\b(?:orange\s*money|momo|mtn\s*money|wave)\b/i,
    // Variations spécifiques d'acronymes avec délimiteurs stricts
    /(?:^|\s|\W)(?:om|m-o-m-o|o-m|o\.m)(?:\s|\W|$)/i,
    // Devises et transactions
    /\b(?:fcfa|cfa|francs?|euro|dollars?)\b/i,
    /\b\d+\s*(?:k|fcfa|frs|cfa)\b/i,
    // Termes d'échange financier explicite
    /\b(?:payer|payement|paiement|rémunération|remuneration|dépôt|depot|tarif|combien\s*tu\s*prends)\b/i,
    // Argot transactionnel camerounais / étudiant
    /\b(?:verse\s*moi|envoie\s*le\s*crédit|fais\s*un\s*dépôt|mèche|chaussure)\b/i,
    // Tentative de déviation vers WhatsApp / Téléphone (numéros camerounais 9 chiffres : 6xx...)
    /\b(?:\+?237\s*)?6[25789]\d{1}[-.\s]?\d{2}[-.\s]?\d{2}[-.\s]?\d{2}\b/
];

/**
 * Vérifie si le texte contient une tentative de transaction ou de détournement
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
