const TranslateService = require('../services/translate.service');

class TranslateController {
  static async translate(req, res, next) {
    try {
      const { text, targetLang, sourceLang, skillTag } = req.body;
      const target = TranslateService.normalizeLang(targetLang, req.user?.preferredLang || 'fr');
      const result = await TranslateService.translateText(text, target, { sourceLang, skillTag });
      return res.status(200).json({
        status: 'success',
        engine: result.engine,
        cached: result.cached,
        sourceLang: result.sourceLang,
        targetLang: result.targetLang,
        original: result.original,
        translated: result.translated,
        poweredBy: 'Muse Spark (Meta Model API)'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = TranslateController;