const express = require('express');
const {Planet, Post, Image} = require('../models');

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const posts = await Planet.findAll({
            order: [['createdAt', 'DESC']],
            include: [{
                model: Post,
            }],
        });

        res.status(200).json(posts);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

module.exports = router;