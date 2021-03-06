const express = require('express');
const bcrypet = require('bcrypt')
const jwt = require('jsonwebtoken');

const router = express.Router();

const User = require('../models/user');

router.post('/signup', (req, res, next) => {

    bcrypet.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            })

            user.save()
                .then(result => {
                    res.status(201).json({
                        message: 'User created!',
                        result: result
                    })
                })
                .catch(error => {
                    res.status(500).json({
                            message:"Invalid authentication credentials!"
                    })
                })

        })

})

router.post('/login', (req, res, next) => {
    let fetchedUser;
    User.findOne({ email: req.body.email }).then(user => {
        console.log(user);
        if (user.length <= 0) {
            return res.status(401).json({
                message: 'Auth failed'
            });
        }
        fetchedUser = user;
        return bcrypet.compare(req.body.password, user.password)
       
    })
        .then(result => {
            if (!result) {
                return res.status(401).json({
                    message: 'Auth failed'
                })
            }
            const token = jwt.sign(
                { email: fetchedUser.email, userId: fetchedUser._id },
                'secret_this_should_be_longer',
                { expiresIn: '1h' }
            );

            res.status(200).json({
                token: token,
                expiresIn: 3600,
                userId: fetchedUser._id
            })

        })
        .catch(error => {
            res.status(401).json({
                message: 'Invalid authentication credentials!'
            });
        })
})

module.exports = router;