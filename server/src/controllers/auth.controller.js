const AuthService = require('../services/auth.service');

class AuthController {
    static async register(req, res, next) {
        try {
            const { username, email, password, skillsDeclarated, preferredLang } = req.body;
            const result = await AuthService.register({ username, email, password, skillsDeclarated, preferredLang });
            res.status(201).json({
                status: 'success',
                message: 'Compte créé avec succès !',
                ...result
            });
        } catch (err) {
            next(err);
        }
    }

    static async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await AuthService.login({ email, password });
            res.status(200).json({
                status: 'success',
                message: 'Connexion réussie ! Bon retour parmi nous.',
                ...result
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = AuthController;
