const express = require('express');
const multer = require('multer');
const path = require('path');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');

const { Planet, Post, Image, Hashtag } = require('../models');
// const { isLoggedIn } = require('./middlewares');

const router = express.Router();

AWS.config.update({
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    region: 'us-east-1',
});

const upload = multer({
    storage: multerS3({
        s3: new AWS.S3(),
        bucket: 's3-omo',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key(req, file, cb) {
            cb(null, `original/${Date.now()}_${path.basename(file.originalname)}`)
        }
    }),
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

router.post('/planet', async (req, res, next) => {
    try {
        const planet = await Planet.create({
            title: req.body.title,
            planetForm: req.body.planetForm,
            isDelete: false,
        });
        res.status(201).json({ message : "ok" });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.patch('/planet/:planetId', async (req, res, next) => {
    try {
        const planet = await Planet.findOne({
            where: { id: req.params.planetId }
        })
        await Planet.update({
            isDelete: req.body.isDelete,
        }, {
            where: { id: req.params.planetId }
        });
        res.status(201).json({ message : "ok" });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.post('/:planetId/diary', upload.array('image'), async (req, res, next) => {
    try {
        const planet = await Planet.findOne({
            where: { id: req.params.planetId }
        })
        if (!planet) {
            return res.status(403).send('존재하지 않는 행성입니다.');
        }
        const hashtags = req.body.content.match(/#[^\s#]+/g);
        console.log(planet.id);
        const post = await Post.create({
            content: req.body.content,
            PlanetId: planet.id,
            isDelete: false,
        });
        if (hashtags) {
            const result = await Promise.all(hashtags.map((tag) => Hashtag.findOrCreate({
                where: { name: tag.slice(1).toLowerCase() },
            })));
            await post.addHashtags(result.map((v) => v[0]));
        }
        if (req.files) {
            const images = await Promise.all(req.files.map((image) => Image.create({ src: image.location })));
            await post.addImages(images);
        }
        res.status(201).json({ message : "ok" });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.patch('/diary/:diaryId', async (req, res, next) => {
    try {
        await Post.update({
            isDelete: req.body.isDelete,
        }, {
            where: { id: req.params.diaryId }
        });
        res.status(201).json({ message : "ok" });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.post('/images', upload.array('image'),async (req, res, next) => {
    console.log(req.files);
    res.json(req.files.map((v) => v.location))
});

router.delete('/:postId', async (req, res, next) => {
    try {
        await Post.destroy({
           where: {
               id: req.params.postId,
           }
        });
        res.json({ PostId: parseInt(req.params.postId, 10) });
    } catch(error) {
        console.error(error);
        next(error);
    }
});

module.exports = router;
