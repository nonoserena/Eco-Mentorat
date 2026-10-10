const PDFDocument = require('pdfkit');
const User = require('../models/User');
const AppError = require('../errors/AppError');

class PdfService {
    /**
     * Génère le flux PDF du portfolio certifié
     */
    static async generatePortfolio(userId, outputStream) {
        const user = await User.findById(userId);
        if (!user) {
            throw new AppError('Utilisateur introuvable.', 404);
        }

        const doc = new PDFDocument({ margin: 50 });
        doc.pipe(outputStream);

        // Bandeau d'en-tête
        doc.rect(0, 0, doc.page.width, 25).fill('#1e3a8a');
        doc.moveDown(2);

        // Titre
        doc.fillColor('#1e3a8a').fontSize(26).text('ÉCO-MENTORAT', { align: 'center', bold: true });
        doc.fillColor('#4b5563').fontSize(12).text("Bilan Officiel de Compétences et d'Entraide Académique", { align: 'center' });
        doc.moveDown(1);
        doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke('#e5e7eb');
        doc.moveDown(2);

        // Informations utilisateur
        doc.fillColor('#111827').fontSize(16).text(`Profil Certifié : ${user.username}`, { underline: true });
        doc.fillColor('#374151').fontSize(12)
           .text(`Identifiant : ${user._id}`)
           .text(`XP Global : ${user.xpPoints} XP`)
           .text(`Grade Actuel : ${user.rankTitle}`)
           .text(`Date d'émission : ${new Date().toLocaleDateString('fr-FR')}`);
        doc.moveDown(2);

        // Statistiques par matière
        doc.fillColor('#111827').fontSize(16).text('Statistiques Validées par Matière', { underline: true });
        doc.moveDown(1);

        if (!user.skillsMetrics || user.skillsMetrics.length === 0) {
            doc.fillColor('#6b7280').fontSize(12).text("Aucune session d'entraide validée pour le moment.");
        } else {
            user.skillsMetrics.forEach(metric => {
                doc.fillColor('#1e3a8a').fontSize(13).text(`Matière : ${metric.skillTag}`, { bold: true });
                doc.fillColor('#374151').fontSize(11)
                   .text(`  • Réputation : ${metric.reputationScore} / 5.0`)
                   .text(`  • Sessions d'aide réussies : ${Math.max(0, metric.helpCount - 1)}`)
                   .text(`  • Étudiants distincts aidés : ${metric.uniqueUsersHelped ? metric.uniqueUsersHelped.length : 0}`);
                doc.moveDown(0.5);
            });
        }

        // Bas de page / Certification
        doc.moveDown(3);
        doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke('#e5e7eb');
        doc.moveDown(1);
        doc.rect(50, doc.y, doc.page.width - 100, 60).fill('#f3f4f6');
        doc.fillColor('#065f46').fontSize(10)
           .text('CERTIFICATION AUTHENTIQUE — ÉCO-MENTORAT', 60, doc.y + 10, { bold: true })
           .fillColor('#374151')
           .text('Les scores sont calculés par algorithme pondéré à trois facteurs et protégés contre la collusion.', 60, doc.y + 5);

        doc.end();
        return user.username;
    }
}

module.exports = PdfService;
