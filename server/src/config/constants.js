/**
 * Constantes du domaine Eco-Mentorat
 */

const RANKS = {
    NOVICE: 'Novice',
    APPRENTI: 'Apprenti',
    CONFIRME: 'Confirmé',
    EXPERT: 'Expert',
    LEGENDE: 'Légende'
};

const XP_THRESHOLDS = [
    { rank: RANKS.LEGENDE, minXP: 5000 },
    { rank: RANKS.EXPERT,  minXP: 2000 },
    { rank: RANKS.CONFIRME, minXP: 800 },
    { rank: RANKS.APPRENTI, minXP: 200 },
    { rank: RANKS.NOVICE,  minXP: 0 }
];

const REPUTATION = {
    DEFAULT_SCORE: 5.0,
    MAX_SCORE: 5.0,
    WEIGHT_PEDAGOGY: 0.2,
    WEIGHT_SERIOUSNESS: 0.6,
    WEIGHT_SHARING: 0.2,
    COLLUSION_WINDOW_HOURS: 48
};

const TICKETS = {
    DEFAULT_QUOTA: 10,
    RELOAD_INTERVAL_DAYS: 7
};

module.exports = {
    RANKS,
    XP_THRESHOLDS,
    REPUTATION,
    TICKETS
};
