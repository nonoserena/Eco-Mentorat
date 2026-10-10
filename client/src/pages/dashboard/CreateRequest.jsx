import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { createRequest } from '../../services/api';

export default function CreateRequest() {
    const navigate = useNavigate();
    const [query, setQuery]     = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState('');
    const [blocked, setBlocked] = useState(false);

    const detectSkillTag = (text) => {
        const t = text.toLowerCase();
        if (t.includes('java') || t.includes('spring') || t.includes('jee')) return '#java';
        if (t.includes('python') || t.includes('django') || t.includes('flask')) return '#python';
        if (t.includes('réseau') || t.includes('reseau') || t.includes('cisco') || t.includes('switch')) return '#reseau';
        if (t.includes('linux') || t.includes('ubuntu') || t.includes('bash')) return '#linux';
        if (t.includes('droit') || t.includes('juridique') || t.includes('loi')) return '#droit';
        if (t.includes('html') || t.includes('css') || t.includes('react') || t.includes('web')) return '#web';
        if (t.includes('math') || t.includes('calcul') || t.includes('algèbre')) return '#mathematiques';
        if (t.includes('physique') || t.includes('mécanique')) return '#physique';
        return '#general';
    };

    const handleSubmit = async () => {
        if (!query.trim()) return setError('Décris ton problème pour continuer.');
        if (query.trim().length < 10) return setError('Décris ton problème un peu plus en détail.');

        setLoading(true);
        setError('');

        try {
            const skillTag    = detectSkillTag(query);
            const title       = query.length > 80 ? query.substring(0, 80) + '...' : query;
            const description = query;

            await createRequest({ title, description, skillTag });
            navigate('/home');

        } catch (err) {
            const status  = err.response?.status;
            const message = err.response?.data?.message || '';

            if (status === 403) {
                setBlocked(true);
            } else if (message.includes('interdites')) {
                setError('⚠️ Ta demande contient des termes non autorisés sur Eco-Mentorat.');
            } else {
                setError('Une erreur est survenue. Réessaie dans quelques instants.');
            }
        } finally {
            setLoading(false);
        }
    };

    const detectedTag = query.trim() ? detectSkillTag(query) : null;

    // ── ÉCRAN BLOQUÉ ──
    if (blocked) {
        return (
            <DashboardLayout>
                <div className="max-w-lg mx-auto py-16 text-center">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
                        <div className="text-6xl mb-4">🤝</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">
                            C'est ton tour d'aider !
                        </h2>
                        <p className="text-gray-500 text-sm leading-relaxed mb-6">
                            Tu as beaucoup sollicité la communauté ces derniers temps.<br />
                            Pour continuer à recevoir de l'aide, aide un camarade à son tour !
                        </p>

                        <div className="bg-gray-50 rounded-xl p-4 mb-6">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                Ta mission
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div className="bg-gradient-to-r from-blue-900 to-violet-600 h-2 rounded-full w-0"></div>
                                </div>
                                <span className="text-xs text-gray-500">0/1 aide donnée</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                                Aide 1 camarade pour débloquer tes demandes 🔓
                            </p>
                        </div>

                        <button
                            onClick={() => navigate('/home')}
                            className="w-full py-3 bg-gradient-to-r from-blue-900 to-violet-600 text-white font-semibold rounded-xl hover:from-blue-800 hover:to-violet-500 transition shadow-md"
                        >
                            Voir les demandes d'aide 👀
                        </button>

                        <p className="text-xs text-gray-400 mt-4">
                            Eco-Mentorat fonctionne grâce à l'entraide mutuelle 💙
                        </p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // ── ÉCRAN NORMAL ──
    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Tu es bloqué ? 🤔</h1>
                    <p className="text-gray-500 mt-1 text-sm">
                        Décris ton problème simplement, on trouve un mentor pour toi !
                    </p>
                </div>

                {/* Card principale */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm flex items-center gap-2">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <textarea
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); setError(''); }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit();
                            }
                        }}
                        placeholder="Ex : Besoin d'aide pour un exercice en Python sur les boucles..."
                        rows={5}
                        maxLength={500}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none bg-gray-50 focus:bg-white"
                    />
                    <p className="text-xs text-gray-400 text-right mt-1 mb-3">{query.length}/500</p>

                    {/* Tag détecté */}
                    {detectedTag && (
                        <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-xl">
                            <span className="text-sm text-gray-500">Matière détectée :</span>
                            <span className="bg-gradient-to-r from-blue-900 to-violet-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                                {detectedTag}
                            </span>
                            <span className="text-xs text-gray-400">
                                Les mentors en {detectedTag} seront alertés 🔔
                            </span>
                        </div>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={loading || !query.trim()}
                        className="w-full bg-gradient-to-r from-blue-900 to-violet-600 hover:from-blue-800 hover:to-violet-500 text-white font-semibold py-3 rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Publication en cours...
                            </>
                        ) : '📤 Envoyer ma demande'}
                    </button>

                    <p className="text-center text-xs text-gray-400 mt-3">
                        Appuie sur <kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">Entrée</kbd> pour envoyer rapidement
                    </p>
                </div>

                {/* Exemples */}
                <div className="mt-6">
                    <p className="text-sm text-gray-500 mb-3">Exemples de demandes :</p>
                    <div className="flex flex-wrap gap-2">
                        {[
                            "Besoin d'aide pour un exercice en Python",
                            "Je bloque sur les pointeurs en C",
                            "Exercice de droit des contrats",
                            "Configuration d'un switch Cisco",
                            "Aide pour comprendre les boucles Java"
                        ].map(example => (
                            <button
                                key={example}
                                onClick={() => setQuery(example)}
                                className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full hover:border-blue-400 hover:text-blue-700 transition"
                            >
                                {example}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}