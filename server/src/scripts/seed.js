/**
 * Script de réinitialisation et de peuplement (Seeder) de la base de données Éco-Mentorat
 * Permet de régénérer instantanément un jeu de données complet et réaliste.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { MONGO_URI } = require('../config/env');
const User = require('../models/User');
const Request = require('../models/Request');
const Message = require('../models/Message');

const seedDatabase = async () => {
    try {
        console.log('🔄 Connexion à MongoDB pour le seeding...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connecté à MongoDB.');

        // Nettoyage complet
        console.log('🧹 Nettoyage des anciennes collections...');
        await Promise.all([
            User.deleteMany({}),
            Request.deleteMany({}),
            Message.deleteMany({})
        ]);
        console.log('✨ Base de données nettoyée.');

        const passwordHash = await bcrypt.hash('Password123!', 12);

        // 1. Création d'utilisateurs réalistes avec différents grades
        console.log('👥 Création des utilisateurs...');
        const users = await User.create([
            {
                username: 'serena_dev',
                email: 'serena@cenulape.cm',
                password: passwordHash,
                xpPoints: 5400,
                rankTitle: 'Légende',
                requestsLeft: 10,
                skillsDeclarated: ['#java', '#web', '#securite'],
                skillsMetrics: [
                    {
                        skillTag: '#java',
                        reputationScore: 4.9,
                        totalStars: 49,
                        acceptedCount: 11,
                        helpCount: 10,
                        uniqueUsersHelped: []
                    },
                    {
                        skillTag: '#web',
                        reputationScore: 5.0,
                        totalStars: 40,
                        acceptedCount: 8,
                        helpCount: 8,
                        uniqueUsersHelped: []
                    }
                ]
            },
            {
                username: 'alan_turing',
                email: 'alan@cenulape.cm',
                password: passwordHash,
                xpPoints: 2350,
                rankTitle: 'Expert',
                requestsLeft: 10,
                skillsDeclarated: ['#python', '#mathematiques'],
                skillsMetrics: [
                    {
                        skillTag: '#python',
                        reputationScore: 4.8,
                        totalStars: 38,
                        acceptedCount: 9,
                        helpCount: 8,
                        uniqueUsersHelped: []
                    }
                ]
            },
            {
                username: 'marie_curie',
                email: 'marie@cenulape.cm',
                password: passwordHash,
                xpPoints: 920,
                rankTitle: 'Confirmé',
                requestsLeft: 8,
                skillsDeclarated: ['#physique', '#mathematiques'],
                skillsMetrics: [
                    {
                        skillTag: '#physique',
                        reputationScore: 4.7,
                        totalStars: 23,
                        acceptedCount: 6,
                        helpCount: 5,
                        uniqueUsersHelped: []
                    }
                ]
            },
            {
                username: 'christian_juriste',
                email: 'christian@cenulape.cm',
                password: passwordHash,
                xpPoints: 340,
                rankTitle: 'Apprenti',
                requestsLeft: 6,
                skillsDeclarated: ['#droit'],
                skillsMetrics: [
                    {
                        skillTag: '#droit',
                        reputationScore: 4.5,
                        totalStars: 9,
                        acceptedCount: 3,
                        helpCount: 2,
                        uniqueUsersHelped: []
                    }
                ]
            },
            {
                username: 'kevin_etudiant',
                email: 'kevin@cenulape.cm',
                password: passwordHash,
                xpPoints: 50,
                rankTitle: 'Novice',
                requestsLeft: 9,
                skillsDeclarated: ['#reseau'],
                skillsMetrics: []
            }
        ]);

        const [serena, alan, marie, christian, kevin] = users;

        // Liaison des utilisateurs aidés
        serena.skillsMetrics[0].uniqueUsersHelped = [kevin._id, christian._id];
        serena.skillsMetrics[1].uniqueUsersHelped = [kevin._id];
        alan.skillsMetrics[0].uniqueUsersHelped = [kevin._id];
        await serena.save();
        await alan.save();

        // 2. Création de demandes réalistes
        console.log('📋 Création des demandes d\'entraide...');
        const requests = await Request.create([
            {
                requesterId: kevin._id,
                mentorId: null,
                title: 'Erreur NullPointerException sur un tableau d\'objets',
                description: 'Bonjour, j\'ai une exception quand j\'essaie d\'itérer sur mon tableau d\'étudiants en Java. Quelqu\'un peut m\'expliquer où j\'ai oublié d\'instancier ?',
                skillTag: '#java',
                status: 'open'
            },
            {
                requesterId: kevin._id,
                mentorId: null,
                title: 'Compréhension du routage OSPF vs RIP',
                description: 'Je prépare mon examen de réseaux CCNA et je confonds les métriques de convergence entre OSPF et RIP.',
                skillTag: '#reseau',
                status: 'open'
            },
            {
                requesterId: christian._id,
                mentorId: serena._id,
                title: 'Configuration de Flexbox et Tailwind CSS responsive',
                description: 'Mon conteneur déborde sur mobile et mes cartes ne s\'empilent pas proprement.',
                skillTag: '#web',
                status: 'in-progress'
            },
            {
                requesterId: kevin._id,
                mentorId: alan._id,
                title: 'Optimisation d\'un script pandas pour charger un gros CSV',
                description: 'Mon script met 4 minutes à lire un fichier de 500 Mo. Comment utiliser le chunking ?',
                skillTag: '#python',
                status: 'completed',
                rating: 5
            }
        ]);

        // 3. Création de messages de discussion dans la session en cours
        console.log('💬 Création des messages d\'exemple...');
        const sessionInProgress = requests[2];
        await Message.create([
            {
                requestId: sessionInProgress._id,
                senderId: christian._id,
                senderUsername: christian.username,
                content: 'Salut Serena ! Merci d\'avoir accepté ma demande.',
                type: 'text'
            },
            {
                requestId: sessionInProgress._id,
                senderId: serena._id,
                senderUsername: serena.username,
                content: 'Hello Christian ! Avec plaisir. Peux-tu me montrer ton code JSX ou ta classe Tailwind ?',
                type: 'text'
            },
            {
                requestId: sessionInProgress._id,
                senderId: christian._id,
                senderUsername: christian.username,
                content: 'J\'utilise "flex flex-row" mais sur écran mobile ça ne passe pas à la ligne.',
                type: 'text'
            },
            {
                requestId: sessionInProgress._id,
                senderId: serena._id,
                senderUsername: serena.username,
                content: 'Remplace par "flex flex-col md:flex-row" pour que le layout soit vertical par défaut sur mobile, et horizontal à partir des écrans moyens !',
                type: 'text'
            }
        ]);

        console.log('====================================================');
        console.log('🎉 BASE DE DONNÉES RÉGÉNÉRÉE AVEC SUCCÈS !');
        console.log(`👤 5 utilisateurs créés (Mot de passe commun : Password123!)`);
        console.log(`   - serena_dev (Légende - serena@cenulape.cm)`);
        console.log(`   - alan_turing (Expert - alan@cenulape.cm)`);
        console.log(`   - marie_curie (Confirmé - marie@cenulape.cm)`);
        console.log(`   - christian_juriste (Apprenti - christian@cenulape.cm)`);
        console.log(`   - kevin_etudiant (Novice - kevin@cenulape.cm)`);
        console.log(`📋 4 demandes créées (ouvertes, en cours, terminées)`);
        console.log(`💬 Historique de chat persistant inséré`);
        console.log('====================================================');

    } catch (err) {
        console.error('❌ Erreur lors du seeding :', err);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Connexion MongoDB fermée.');
        process.exit(0);
    }
};

seedDatabase();
