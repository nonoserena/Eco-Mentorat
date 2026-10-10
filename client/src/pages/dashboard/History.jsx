import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { getHistory, getMyRequests, getMyHelps } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const TABS = [
    { id: 'general',  label: '📋 Historique général',    icon: '📋' },
    { id: 'requests', label: '🙋 Mes demandes',           icon: '🙋' },
    { id: 'helps',    label: '🤝 Mes aides apportées',    icon: '🤝' },
];

const STATUS_STYLES = {
    'open':        { label: '🟢 Ouverte',    class: 'bg-green-100 text-green-700' },
    'in-progress': { label: '🔒 En cours',   class: 'bg-orange-100 text-orange-700' },
    'completed':   { label: '✅ Terminée',   class: 'bg-blue-100 text-blue-700' },
    'contested':   { label: '⚠️ Contestée', class: 'bg-red-100 text-red-700' },
};

const TAG_STYLES = {
    '#java':          'bg-orange-100 text-orange-700',
    '#reseau':        'bg-blue-100 text-blue-700',
    '#linux':         'bg-green-100 text-green-700',
    '#python':        'bg-yellow-100 text-yellow-700',
    '#droit':         'bg-purple-100 text-purple-700',
    '#web':           'bg-pink-100 text-pink-700',
    '#mathematiques': 'bg-red-100 text-red-700',
    '#physique':      'bg-cyan-100 text-cyan-700',
};

export default function History() {
    const { user }              = useAuth();
    const [activeTab, setActiveTab] = useState('general');
    const [data, setData]       = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage]       = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal]     = useState(0);

    const fetchData = async () => {
        setLoading(true);
        try {
            let res;
            if (activeTab === 'general')  res = await getHistory(page, 15);
            if (activeTab === 'requests') res = await getMyRequests(page, 15);
            if (activeTab === 'helps')    res = await getMyHelps(page, 15);
            setData(res.data.requests);
            setTotalPages(res.data.totalPages);
            setTotal(res.data.total);
        } catch {
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPage(1);
    }, [activeTab]);

    useEffect(() => {
        fetchData();
    }, [activeTab, page]);

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getStars = (rating) => {
        if (!rating) return null;
        return '★'.repeat(rating) + '☆'.repeat(5 - rating);
    };

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Historique 📜</h1>
                <p className="text-gray-500 text-sm mt-1">
                    Consultez l'historique des sessions d'entraide
                </p>
            </div>

            {/* Onglets */}
            <div className="flex gap-2 mb-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition ${
                            activeTab === tab.id
                                ? 'bg-gradient-to-r from-blue-900 to-violet-600 text-white shadow-md'
                                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Compteur */}
            <p className="text-sm text-gray-500 mb-4">
                {total} session{total > 1 ? 's' : ''} trouvée{total > 1 ? 's' : ''}
            </p>

            {/* Contenu */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : data.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                    <p className="text-5xl mb-3">
                        {activeTab === 'general'  && '📋'}
                        {activeTab === 'requests' && '🙋'}
                        {activeTab === 'helps'    && '🤝'}
                    </p>
                    <p className="text-gray-500 font-medium">
                        {activeTab === 'general'  && 'Aucune session terminée pour le moment.'}
                        {activeTab === 'requests' && "Vous n'avez pas encore publié de demande."}
                        {activeTab === 'helps'    && "Vous n'avez pas encore aidé de camarade."}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {data.map((req) => {
                        const statusInfo = STATUS_STYLES[req.status] || STATUS_STYLES['open'];
                        const tagStyle   = TAG_STYLES[req.skillTag] || 'bg-gray-100 text-gray-600';

                        return (
                            <div
                                key={req._id}
                                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        {/* Tags */}
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tagStyle}`}>
                                                {req.skillTag}
                                            </span>
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusInfo.class}`}>
                                                {statusInfo.label}
                                            </span>
                                            {/* Rôle de l'utilisateur */}
                                            {activeTab === 'general' && (
                                                req.requesterId === user?.id ? (
                                                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                                                        👤 Ma demande
                                                    </span>
                                                ) : req.mentorId === user?.id ? (
                                                    <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                                                        🎓 J'ai aidé
                                                    </span>
                                                ) : null
                                            )}
                                        </div>

                                        {/* Titre */}
                                        <h3 className="text-gray-800 font-semibold text-sm mb-1 truncate">
                                            {req.title}
                                        </h3>

                                        {/* Description */}
                                        <p className="text-gray-500 text-xs line-clamp-2">
                                            {req.description}
                                        </p>

                                        {/* Note si terminée */}
                                        {req.status === 'completed' && req.rating && (
                                            <p className="text-yellow-500 text-sm mt-2">
                                                {getStars(req.rating)}
                                                <span className="text-gray-400 text-xs ml-2">{req.rating}/5</span>
                                            </p>
                                        )}
                                    </div>

                                    {/* Date */}
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-gray-400 text-xs">
                                            {formatDate(req.createdAt)}
                                        </p>
                                        {req.status === 'completed' && req.updatedAt && (
                                            <p className="text-gray-300 text-xs mt-1">
                                                Terminée le {formatDate(req.updatedAt)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-6">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 transition"
                    >
                        ← Précédent
                    </button>
                    <span className="text-sm text-gray-500 bg-white px-4 py-2 rounded-xl border border-gray-200">
                        Page {page} / {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 transition"
                    >
                        Suivant →
                    </button>
                </div>
            )}
        </DashboardLayout>
    );
}