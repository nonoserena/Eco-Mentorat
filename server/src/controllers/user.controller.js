const UserService = require('../services/user.service');
const PdfService = require('../services/pdf.service');
const AppError = require('../errors/AppError');

class UserController {
    static async getLeaderboard(req, res, next) {
        try {
            const { skill } = req.query;
            const result = await UserService.getLeaderboard({ skill });
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    }

    static async getMyProfile(req, res, next) {
        try {
            const user = await UserService.getMyProfile(req.user.id);
            res.status(200).json({ user });
        } catch (err) {
            next(err);
        }
    }

    static async updateLang(req, res, next) {
        try {
            const { preferredLang } = req.body;
            const user = await UserService.updatePreferredLang(req.user.id, preferredLang);
            res.status(200).json({ status: 'success', user });
        } catch (err) {
            next(err);
        }
    }

    static async getPortfolio(req, res, next) {
        try {
            const { id } = req.params;
            if (id !== req.user.id) {
                throw new AppError('Accès non autorisé à ce portfolio.', 403);
            }

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=Portfolio_EcoMentorat_${req.user.username}.pdf`);

            await PdfService.generatePortfolio(id, res);
        } catch (err) {
            next(err);
        }
    }

    static async getPublicProfile(req, res, next) {
        try {
            const { username } = req.params;
            const profile = await UserService.getPublicProfile(username);
            res.status(200).json({ status: 'success', profile });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = UserController;
