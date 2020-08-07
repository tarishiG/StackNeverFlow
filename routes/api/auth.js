const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const key = require("../../setup/myurl");

//@type    GET
//@route   /api/auth
//@desc    just for testing
//@access  PUBLIC
router.get("/", (req, res) =>
    res.json({
        test: "Auth is being tested."
    }));
//Import schema for Person to Register
const Person = require("../../models/Person");
const jsonwtStrategy = require("../../strategies/jsonwtStrategy");
const passport = require("passport");

//@type    POST
//@route   /api/auth/register
//@desc    route for registration for users
//@access  PUBLIC
router.post("/register", (req, res) => {
    Person.findOne({
            email: req.body.email
        })
        .then(person => {
            if (person) {
                return res.status(400).json({
                    emailerror: "Email is already rergisterd"
                })
            } else {
                const newPerson = new Person({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password,
                    gender: req.body.gender
                });
                //Encrypt password using bcryptjs
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newPerson.password, salt, (err, hash) => {
                        // Store hash in your password DB.
                        if (err) throw err;
                        newPerson.password = hash;
                        newPerson
                            .save()
                            .then(person => res.json(person))
                            .catch(err => console.log(err));
                    });
                });
            }
        })
        .catch(err => console.log(err));
});

//@type    POST
//@route   /api/auth/login
//@desc    route for login for users
//@access  PUBLIC
router.post("/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    Person.findOne({
            email
        })
        .then(person => {
            if (!person) {
                return res.status(404).json({
                    emailerror: "User not found with this email"
                })
            }
            bcrypt
                .compare(password, person.password)
                .then(isCorrect => {
                    if (isCorrect) {
                        //res.json({success: "User is able to login successfully"});
                        // use payload and create token for user
                        const payload = {
                            id: person.id,
                            name: person.name,
                            email: person.email
                        };
                        jwt.sign(
                            payload,
                            key.secret, {
                                expiresIn: 60 * 60
                            },
                            (err, token) => {
                                if (err) {
                                    res.json({
                                        success: false
                                    });
                                };
                                res.json({
                                    success: true,
                                    token: "Bearer " + token
                                })
                            }
                        );
                    } else {
                        res.status(400).json({
                            passworderror: "Password is not correct"
                        });
                    }
                })
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
});

//@type    GET
//@route   /api/auth/profile
//@desc    route for profiles of users
//@access  PRIVATE
router.get("/profile", passport.authenticate("jwt", {
    session: false
}), (req, res) => {
    //console.log(req);
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        gender: req.user.gender,
        profilepic: req.user.profilepic
    });
});

module.exports = router;