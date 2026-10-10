/**
 * Normalisation et regroupement sémantique des SkillTags
 */

const DICTIONNAIRE_SEMANTIQUE = {
    'reseau':        ['reseau', 'reseaux', 'network', 'cisco', 'switch', 'routing', 'ccna', 'telecom', 'réseaux'],
    'java':          ['java', 'jee', 'springboot', 'spring', 'poo java'],
    'droit':         ['droit', 'juridique', 'loi', 'constitution', 'droit civil', 'droit des affaires'],
    'linux':         ['linux', 'ubuntu', 'debian', 'bash', 'scripting', 'sysadmin', 'unix'],
    'python':        ['python', 'django', 'flask', 'pandas', 'numpy', 'fastapi', 'data science'],
    'web':           ['html', 'css', 'javascript', 'react', 'vue', 'angular', 'frontend', 'web', 'tailwind', 'node'],
    'mathematiques': ['math', 'maths', 'mathematiques', 'algebre', 'calcul', 'statistiques', 'analyse'],
    'physique':      ['physique', 'mecanique', 'thermodynamique', 'optique', 'electricite'],
    'bdd':           ['sql', 'mysql', 'postgres', 'postgresql', 'mongodb', 'base de donnees', 'bdd', 'oracle'],
    'securite':      ['cybersecurite', 'securite', 'cryptographie', 'pentest', 'ethical hacking', 'owasp']
};

function nettoyerEtRegrouperTag(tagBrut) {
    if (!tagBrut) return '#general';
    let clean = tagBrut.toLowerCase().trim();
    if (clean.startsWith('#')) clean = clean.substring(1);

    for (const [racine, variantes] of Object.entries(DICTIONNAIRE_SEMANTIQUE)) {
        if (variantes.includes(clean) || clean.includes(racine)) {
            return `#${racine}`;
        }
    }

    const camelCased = clean
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9 ]/g, '')
        .split(' ')
        .map((mot, i) => i === 0 ? mot : mot.charAt(0).toUpperCase() + mot.slice(1))
        .join('');

    return `#${camelCased || 'general'}`;
}

module.exports = {
    nettoyerEtRegrouperTag,
    DICTIONNAIRE_SEMANTIQUE
};
