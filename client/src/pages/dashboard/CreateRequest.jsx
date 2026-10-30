import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { createRequest } from '../../services/api';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '../../utils/format';
export default function CreateRequest() {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const lang = (i18n.language || 'fr').slice(0,2);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [blocked, setBlocked] = useState(false);
    const detectSkillTag = (text) => {
        const txt = text.toLowerCase();
        if (txt.includes('java') || txt.includes('spring') || txt.includes('jee')) return '#java';
        if (txt.includes('python') || txt.includes('django') || txt.includes('flask')) return '#python';
        if (txt.includes('reseau') || txt.includes('cisco') || txt.includes('switch')) return '#reseau';
        if (txt.includes('linux') || txt.includes('ubuntu') || txt.includes('bash')) return '#linux';
        if (txt.includes('droit') || txt.includes('juridique') || txt.includes('loi')) return '#droit';
        if (txt.includes('html') || txt.includes('css') || txt.includes('react') || txt.includes('web')) return '#web';
        if (txt.includes('math') || txt.includes('calcul') || txt.includes('algebre')) return '#mathematiques';
        if (txt.includes('physique') || txt.includes('mecanique')) return '#physique';
        return '#general';
    };
    const handleSubmit = async () => {
        if (!query.trim()) return setError(t('create.errorEmpty'));
        if (query.trim().length < 10) return setError(t('create.errorShort'));
        setLoading(true); setError('');
        try {
            const skillTag = detectSkillTag(query);
            const title = query.length > 80 ? query.substring(0,80)+'...' : query;
            const description = query;
            await createRequest({ title, description, skillTag });
            navigate('/home');
        } catch (err) {
            const status = err.response?.status;
            const message = err.response?.data?.message || '';
            if (status === 403) { setBlocked(true); }
            else if (message.includes('interdites')) { setError('⚠️ '+t('create.errorForbidden')); }
            else { setError(t('create.errorGeneric')); }
        } finally { setLoading(false); }
    };
    const detectedTag = query.trim() ? detectSkillTag(query) : null;
    const examples = [t('create.example1'),t('create.example2'),t('create.example3'),t('create.example4'),t('create.example5')];
    if (blocked) {
        return (<DashboardLayout><div className="max-w-lg mx-auto py-16 text-center"><div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10"><div className="text-6xl mb-4">🤝</div><h2 className="text-2xl font-bold text-gray-800 mb-3">{t('createPage.blockedTitle')}</h2><p className="text-gray-500 text-sm leading-relaxed mb-6">{t('create.blockedDesc1')}<br />{t('create.blockedDesc2')}</p><div className="bg-gray-50 rounded-xl p-4 mb-6"><p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t('create.blockedMission')}</p><div className="flex items-center gap-3"><div className="flex-1 bg-gray-200 rounded-full h-2"><div className="bg-gradient-to-r from-blue-900 to-violet-600 h-2 rounded-full w-0"></div></div><span className="text-xs text-gray-500">{t('create.blockedProgress')}</span></div><p className="text-xs text-gray-400 mt-2">{t('create.blockedHint')} 🔓</p></div><button onClick={()=>navigate('/home')} className="w-full py-3 bg-gradient-to-r from-blue-900 to-violet-600 text-white font-semibold rounded-xl hover:from-blue-800 hover:to-violet-500 transition shadow-md">{t('createPage.seeRequests')} 👀</button><p className="text-xs text-gray-400 mt-4">{t('create.blockedFooter')} 💙</p></div></div></DashboardLayout>);
    }
    return (<DashboardLayout><div className="max-w-2xl mx-auto"><div className="mb-8"><h1 className="text-2xl font-bold text-gray-800">{t('create.title')} 🤔</h1><p className="text-gray-500 mt-1 text-sm">{t('create.subtitle')}</p></div><div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">{error && (<div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm flex items-center gap-2"><span>⚠️</span> {error}</div>)}<textarea value={query} onChange={(e)=>{setQuery(e.target.value);setError('');}} onKeyDown={(e)=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();handleSubmit();}}} placeholder={t('create.placeholder')} rows={5} maxLength={500} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none bg-gray-50 focus:bg-white" /><p className="text-xs text-gray-400 text-right mt-1 mb-3">{formatNumber(query.length,lang)}{t('create.charCount')}</p>{detectedTag && (<div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-xl"><span className="text-sm text-gray-500">{t('create.detected')}</span><span className="bg-gradient-to-r from-blue-900 to-violet-600 text-white text-xs font-semibold px-3 py-1 rounded-full">{detectedTag}</span><span className="text-xs text-gray-400">{t('create.mentorsAlert',{tag:detectedTag})} 🔔</span></div>)}<button onClick={handleSubmit} disabled={loading||!query.trim()} className="w-full bg-gradient-to-r from-blue-900 to-violet-600 hover:from-blue-800 hover:to-violet-500 text-white font-semibold py-3 rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md">{loading ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>{t('create.publishing')}</>) : '📤 '+t('create.submit')}</button><p className="text-center text-xs text-gray-400 mt-3">{t('create.enterHint')}</p></div><div className="mt-6"><p className="text-sm text-gray-500 mb-3">{t('create.examples')}</p><div className="flex flex-wrap gap-2">{examples.map(example=>(<button key={example} onClick={()=>setQuery(example)} className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full hover:border-blue-400 hover:text-blue-700 transition">{example}</button>))}</div></div></div></DashboardLayout>);
}