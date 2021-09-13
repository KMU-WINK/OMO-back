const express = require('express');
const {Planet, Post, Image, Hashtag} = require('../models');

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const posts = await Planet.findAll({
            order: [['createdAt', 'DESC']],
            include: [{
                model: Post,
                include: [
                    {
                        model: Hashtag,
                        attributes: {
                            exclude: ['createdAt', 'updatedAt', 'PostHashtag']
                        }
                    },
                    {
                        model: Image,
                        attributes: {
                            exclude: ['createdAt', 'updatedAt']
                        }
                    }
                ]
            }],
        });

        res.status(200).json(posts);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.get('/:planetId', async (req, res, next) => {
    try {
        const planet = await Planet.findOne({
            where: { id: req.params.planetId },
            include: [{
                model: Post,
                include: [
                    {
                        model: Hashtag,
                        attributes: {
                            exclude: ['createdAt', 'updatedAt', 'PostHashtag']
                        }
                    },
                    {
                        model: Image,
                        attributes: {
                            exclude: ['createdAt', 'updatedAt']
                        }
                    }
                ]
            }],
        })
        res.status(201).json(planet);
    } catch (error) {
        console.error(error);
        next(error);
    }
});
module.exports = router;