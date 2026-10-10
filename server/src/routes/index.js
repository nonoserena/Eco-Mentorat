const express = require('express');
const authRoutes = require('./auth.routes');
const requestRoutes = require('./request.routes');
const chatRoutes = require('./chat.routes');
const userRoutes = require('./user.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/requests', requestRoutes);
router.use('/chat', chatRoutes);
router.use('/users', userRoutes);

module.exports = router;
