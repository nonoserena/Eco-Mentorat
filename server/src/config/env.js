require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
// Fallback local server .env
require('dotenv').config();

const requiredEnvVars = ['JWT_SECRET'];

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`[FATAL] Variable d'environnement manquante : ${envVar}`);
        process.exit(1);
    }
}

module.exports = {
    PORT: process.env.PORT || 5000,
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/eco_mentorat',
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
    NODE_ENV: process.env.NODE_ENV || 'development'
};
