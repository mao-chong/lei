const express = require('express');

const multer = require('multer');
const { errorComparator } = require('tslint/lib/verify/lintError');

const router = express.Router();

const Post = require('../models/post')
const checkAuth = require("../middleware/check-auth")

const MIME_TYPE_MAP = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg"
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const isValid = MIME_TYPE_MAP[file.mimetype];
        let error = new Error("Invalid mime type");
        if (isValid) {
            error = null;
        }
        cb(error, "backend/images")
    },
    filename: (req, file, cb) => {
        const name = file.originalname.toLowerCase().split(' ').join('-');
        const ext = MIME_TYPE_MAP[file.mimetype];
        cb(null, name + '-' + Date.now() + '.' + ext);
    }
})

router.post('',
    checkAuth,
    multer({ storage: storage }).single("image"),
    (req, res, next) => {
        const url = req.protocol + '://' + req.get("host")
        const post = new Post({
            title: req.body.title,
            content: req.body.content,
            imagePath: url + "/images/" + req.file.filename,
            creator: req.userData.userId
        });
        // console.log(req.userData)

        post.save()
        .then(createdPost => {
            res.status(201).json({
                message: 'Post added sucessfully',
                post: {
                    ...createdPost,
                    id: createdPost._id,

                }
            });
        })
        .catch(err=>{
            res.status(500).json({
                message:'Creating a post failed!'
            })
        })
        // console.log(post);
    })

router.get('', (req, res) => {
    const pageSize = +req.query.pagesize;
    const currentPage = +req.query.page;
    const postQuery = Post.find();
    let fethedPosts;
    if (pageSize && currentPage) {
        postQuery
            .skip(pageSize * (currentPage - 1))
            .limit(pageSize);
    }

    postQuery.then((doc) => {
        fetchedPosts = doc;
        return Post.count();
    })
        .then(count => {
            res.status(200).json({
                message: "Posts fetched successfully!",
                posts: fetchedPosts,
                maxPosts: count
            })
        })
        .catch(err=>{
            res.status(500).json({
                message:'Fetching posts failed!'
            });
        })
})

router.get('/:id', (req, res) => {
    Post.findById(req.params.id)
    .then(post => {
        if (post) {
            res.status(200).json(post);
        } else {
            res.status(404).json({ message: 'Post not found' });
        }
    })
    .catch(err=>{
        res.status(500).json({
            message:'Fetching posts failed!'
        });
    })
})

router.delete('/:id', checkAuth, (req, res, next) => {
    console.log(req.params.id);
    Post.deleteOne({ "_id": req.params.id, creator: req.userData.userId })
        .then(result => {
            console.log(result);
            if (result.n > 0) {
                // console.log(result)
                res.status(200).json({ message: "Deletion successful!" })
            } else {
                res.status(401).json({ message: "Not authorized!" })
            }
        })
        .catch(err=>{
            res.status(500).json({
                message:'Fetching posts failed!'
            });
        })
})

router.put('/:id',
    checkAuth,
    multer({ storage: storage }).single("image"),
    (req, res, next) => {

        let imagePath = req.body.imagePath;
        if (req.file) {
            const url = req.protocol + '://' + req.get("host")
            imagePath = url + "/images/" + req.file.filename
        }



        const post = new Post({
            _id: req.body.id,
            title: req.body.title,
            content: req.body.content,
            imagePath: imagePath,
            creator: req.userData.userId
        })

        console.log(post);
        Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post)
        .then(result => {
            if (result.nModified > 0) {

                res.status(200).json({ message: 'Update successful!' })
            } else {
                res.status(401).json({ message: "Not authorized!" })
            }
        })
        .catch(err=>{
            res.status(500).json({
                message:"Couldn't update post!"
            })
        })
    })


module.exports = router;