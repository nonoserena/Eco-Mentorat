import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { getRequests, acceptRequest, getMyRequests } from '../../services/api';

export default function Home() {
    const { user }    = useAuth();
    const navigate    = useNavigate();

    const [requests, setRequests]     = useState([]);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState('');
    const [page, setPage]             = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal]           = useState(0);
    const pollingRef = useRef(null);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await getRequests(page, 10);
            setRequests(res.data.requests);
            setTotalPages(res.data.totalPages);
            setTotal(res.data.total);
        } catch {
            setError('Impossible de charger les demandes.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRequests(); }, [page]);

    // FIX : Polling utilise getMyRequests pour détecter les demandes in-progress
    useEffect(() => {
        if (!user?.id) return;

        let isMounted = true;

        const checkMyRequestStatus = async () => {
            try {
                const res = await getMyRequests(1, 50);
                if (!isMounted) return;

                const myActiveRequest = res.data.requests.find(
                    req => req.status === 'in-progress'
                );

                if (myActiveRequest) {
                    clearInterval(pollingRef.current);
                    navigate(`/chat/${myActiveRequest._id}`);
                }
            } catch {
                // silencieux — ne pas afficher d'erreur pour le polling
            }
        };

        // Premier check immédiat
        checkMyRequestStatus();

        // Puis toutes les 15 secondes (FIX: était 4s, trop agressif)
        pollingRef.current = setInterval(checkMyRequestStatus, 15000);

        return () => {
            isMounted = false;
            clearInterval(pollingRef.current);
        };
    }, [user?.id]);

    const handleAccept = async (requestId) => {
        try {
            await acceptRequest({ requestId });
            navigate(`/chat/${requestId}`);
        } catch (err) {
            alert(err.response?.data?.message || "Erreur lors de l'acceptation.");
        }
    };

    const getBadgeStyle = (tag) => {
        const styles = {
            '#java':           'bg-orange-100 text-orange-700 border-orange-200',
            '#reseau':         'bg-blue-100 text-blue-700 border-blue-200',
            '#linux':          'bg-green-100 text-green-700 border-green-200',
            '#python':         'bg-yellow-100 text-yellow-700 border-yellow-200',
            '#droit':          'bg-purple-100 text-purple-700 border-purple-200',
            '#web':            'bg-pink-100 text-pink-700 border-pink-200',
            '#mathematiques':  'bg-red-100 text-red-700 border-red-200',
            '#physique':       'bg-cyan-100 text-cyan-700 border-cyan-200',
        };
        return styles[tag] || 'bg-gray-100 text-gray-600 border-gray-200';
    };

    const getTimeAgo = (date) => {
        const diff = Math.floor((Date.now() - new Date(date)) / 1000);
        if (diff < 60)    return "À l'instant";
        if (diff < 3600)  return `Il y a ${Math.floor(diff / 60)} min`;
        if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
        return `Il y a ${Math.floor(diff / 86400)}j`;
    };

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Tableau des demandes 📋</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {total} demande{total > 1 ? 's' : ''} en cours — Aide un camarade et gagne des XP !
                    </p>
                </div>
                <button
                    onClick={() => navigate('/create-request')}
                    className="bg-gradient-to-r from-blue-900 to-violet-600 hover:from-blue-800 hover:to-violet-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-md flex items-center gap-2"
                >
                    ✋ Demander de l'aide
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    { icon: '📋', label: 'Demandes actives', value: total },
                    { icon: '⚡', label: 'Tes XP',           value: `${user?.xpPoints ?? 0} XP` },
                    { icon: '🎖️', label: 'Ton grade',        value: user?.rankTitle || 'Novice' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl">
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">{stat.label}</p>
                            <p className="text-lg font-bold text-gray-800">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">
                    {error}
                </div>
            )}

            {/* Liste */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : requests.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                    <p className="text-5xl mb-3">📭</p>
                    <p className="text-gray-500 font-medium">Aucune demande active pour le moment.</p>
                    <p className="text-gray-400 text-sm mt-1">Sois le premier à demander de l'aide !</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="grid grid-cols-12 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        <div className="col-span-1">#</div>
                        <div className="col-span-4">Demande</div>
                        <div className="col-span-2">Matière</div>
                        <div className="col-span-2">Statut</div>
                        <div className="col-span-2">Publié</div>
                        <div className="col-span-1 text-right">Action</div>
                    </div>

                    {requests.map((req, index) => (
                        <div
                            key={req._id}
                            className={`grid grid-cols-12 px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition items-center ${
                                req.status === 'in-progress' ? 'bg-orange-50/30' : ''
                            }`}
                        >
                            <div className="col-span-1 text-gray-400 text-sm font-medium">
                                {(page - 1) * 10 + index + 1}
                            </div>

                            <div className="col-span-4 pr-4">
                                <p className="text-gray-800 font-semibold text-sm truncate">{req.title}</p>
                                <p className="text-gray-400 text-xs mt-0.5 truncate">{req.description}</p>
                            </div>

                            <div className="col-span-2">
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getBadgeStyle(req.skillTag)}`}>
                                    {req.skillTag}
                                </span>
                            </div>

                            {/* FIX: colonne statut visible */}
                            <div className="col-span-2">
                                {req.status === 'in-progress' ? (
                                    <span className="text-xs bg-orange-100 text-orange-700 font-semibold px-2.5 py-1 rounded-full">
                                        🔒 En cours
                                    </span>
                                ) : (
                                    <span className="text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-1 rounded-full">
                                        🟢 Ouverte
                                    </span>
                                )}
                            </div>

                            <div className="col-span-2 text-gray-400 text-xs">
                                {getTimeAgo(req.createdAt)}
                            </div>

                            <div className="col-span-1 flex justify-end">
                                {req.status === 'in-progress' ? (
                                    // FIX: si c'est MA demande in-progress, bouton rejoindre le chat
                                    req.requesterId === user?.id ? (
                                        <button
                                            onClick={() => navigate(`/chat/${req._id}`)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                                        >
                                            Chat 💬
                                        </button>
                                    ) : req.mentorId === user?.id ? (
                                        <button
                                            onClick={() => navigate(`/chat/${req._id}`)}
                                            className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                                        >
                                            Chat 💬
                                        </button>
                                    ) : (
                                        <span className="text-xs text-gray-400 italic">Occupée</span>
                                    )
                                ) : req.requesterId === user?.id ? (
                                    <span className="text-xs text-gray-400 italic">Ma demande</span>
                                ) : (
                                    <button
                                        onClick={() => handleAccept(req._id)}
                                        className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition whitespace-nowrap"
                                    >
                                        Aider ✋
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-6">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                        ← Précédent
                    </button>
                    <span className="text-sm text-gray-500 bg-white px-4 py-2 rounded-xl border border-gray-200">
                        Page {page} / {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                        Suivant →
                    </button>
                </div>
            )}
        </DashboardLayout>
    );
}