const express = require('express');
const router = express.Router();
const User = require('../model/user');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');


// Register route
router.post('/register', (req, res, next) =>{
    let newUser = new User({
        name: req.body.name,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password
    });

    User.addUser(newUser, (err, user) =>{
        if(err){
            res.json({success: false, msg: 'Failed to register user'});
        } else {
            res.json({success: true, msg: 'User registered  '});
        }
    });
});


// Authenticate route
router.post('/authenticate', (req, res, next) =>{
    const username = req.body.username;
    const password = req.body.password;

    User.getUserByUsername(username, (err, user) => {
        if(err){
            throw err;
        }

        if(!user){
            return res.json({success: false, msg: 'User not found'})
        }

        User.comparePassword(password, user.password, (err, isMatch) => {
            if(err) throw err;

            if(isMatch){
                const token = jwt.sign({data:user}, config.secret, {
                    expiresIn: 604800 // 1 weak
                });

                //Response to the frontEnd
                res.json({
                    success: true,
                    token: 'JWT '+ token,
                    //Sending User data so created user object
                    user: {
                        id: user._id,
                        name: user.name,
                        username: user.username,
                        email: user.email
                    }
                
                });
                
            } else{
                return res.json({success: false, msg: 'Wrong Password'})
            }
        });
    });
});


// Profile route
router.get('/profile', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    res.json({user: req.user});
});

module.exports = router;