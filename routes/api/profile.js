const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//Load Person model
const Person = require("../../models/Person");

//Load Profile model
const Profile = require("../../models/Profile");

//@type    GET
//@route   /api/profile
//@desc    route for individual user profile
//@access  PRIVATE
router.get(
    "/",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res) => {
        Profile.findOne({
                user: req.user.id,
            })
            .then((profile) => {
                if (!profile) {
                    return res.status(404).json({
                        profileNotFound: "No profile Found",
                    });
                }
                res.json(profile);
            })
            .catch((err) => console.log(" Got some error in Profile. " + err));
    }
);

//@type    POST
//@route   /api/profile
//@desc    route for UPDATIND/ SAVING individual user profile
//@access  PRIVATE
router.post(
    "/",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res) => {
        const profileValues = {};
        profileValues.user = req.user.id;
        if (req.body.username) profileValues.username = req.body.username;
        if (req.body.website) profileValues.website = req.body.website;
        if (req.body.country) profileValues.country = req.body.country;
        if (req.body.portfolio) profileValues.portfolio = req.body.portfolio;
        if (typeof req.body.languages !== undefined)
            profileValues.languages = req.body.languages.split(",");

        //get social links
        profileValues.social = {};
        if (req.body.youtube) profileValues.social.youtube = req.body.youtube;
        if (req.body.facebook) profileValues.social.facebook = req.body.facebook;
        if (req.body.instagram) profileValues.social.instagram = req.body.instagram;

        //Do database stuff
        Profile.findOne({
                user: req.user.id,
            })
            .then((profile) => {
                if (profile) {
                    Profile.findOneAndModify({
                            user: req.user.id,
                        }, {
                            $set: profileValues,
                        }, {
                            new: true,
                        })
                        .then((profile) => res.json(profile))
                        .catch((err) => console.log("problem in update " + err));
                } else {
                    Profile.findOne({
                            usernmae: profileValues.username,
                        })
                        .then((profile) => {
                            //Username already exists
                            if (profile) {
                                res.status(400).json({
                                    username: "Username already exists",
                                });
                            }
                            //save Profile
                            new Profile(profileValues)
                                .save()
                                .then((profile) => res.json(profile))
                                .catch((err) => console.log(err));
                        })
                        .catch((err) => console.log(err));
                }
            })
            .catch((err) => console.log("Problem in fetching Profile" + err));
    }
);
//@type    GET
//@route   /api/profile/:username
//@desc    route for getting individual user profile based on USERNAME
//@access  PUBLIC
router.get("/:username", (req, res) => {
    Profile.findOne({
            username: req.params.username,
        })
        .populate("user", ["name", "profilepic"])
        .then((profile) => {
            if (!profile) {
                res.status(404).json({
                    usernotfound: "User not fouund",
                });
            }
            res.json(profile);
        })
        .catch((err) => console.log("Error in fetching Username " + err));
});

//@type    GET
//@route   /api/profile/:id
//@desc    route for getting individual user profile based on USERID
//@access  PUBLIC
router.get("/myid/:id", (req, res) => {
    Profile.findOne({
            _id: req.params.id,
        })
        .then((profile) => {
            if (!profile) {
                res.status(404).json({
                    usernotfound: "User not fouund",
                });
            }
            res.json(profile);
        })
        .catch((err) => console.log("Error in fetching UserId" + err));
});

//@type    GET
//@route   /api/profile/everyone
//@desc    route for getting profiles of All users
//@access  PUBLIC
router.get("/find/everyone", (req, res) => {
    Profile.findOne()
        .populate("user", ["name", "profilepic"])
        .then((profiles) => {
            if (!profiles) {
                res.status(404).json({
                    usernotfound: "No users fouund",
                });
            }
            res.json(profiles);
        })
        .catch((err) => console.log("Error in fetching " + err));
});

//@type    DELETE
//@route   /api/profile/
//@desc    route for deleting user based on ID
//@access  PRIVATE
router.delete(
    "/",
    passport.authenticate("jwt", {
        session: false
    }),
    (req, res) => {
        Profile.findOne({
            user: req.user.id,
        });
        Profile.findOneAndRemove({
                user: req.user.id
            })
            .then(() => {
                Person.findOneAndRemove({
                        _id: req.user.id
                    })
                    .then(() =>
                        res.json({
                            success: "Deleted Successfully"
                        })
                    )
                    .catch((err) => console.log(err));
            })
            .catch((err) => console.log(err));
    }
);

//@type    POST
//@route   /api/profile/workrole
//@desc    route for adding work profile of a person
//@access  PRIVATE
router.post(
    "/workrole",
    passport.authenticate("jwt", {
        session: false
    }),
    (req, res) => {
        Profile.findOne({
                user: req.user.id
            })
            .then((profile) => {
                if (!profile) {
                    res.status(404).json({
                        usernotfound: "No users fouund",
                    });
                }
                const newWork = {
                    role: req.body.role,
                    company: req.body.company,
                    country: req.body.country,
                    from: req.body.from,
                    to: req.body.to,
                    current: req.body.current,
                    details: req.body.details,
                };
                //profile.workrole.push(newWork)
                profile.workrole.unshift(newWork);
                profile
                    .save()
                    .then(profile => res.json(profile))
                    .catch(err => console.log(err));
            })
            .catch((err) => console.log(err));
    }
);

//@type    DELETE
//@route   /api/profile/workrole/:w_id
//@desc    route for deleting work profile of a user
//@access  PRIVATE
router.delete("/workrole/:w_id", passport.authenticate("jwt", {
        session: false
    }),
    (req, res) => {
        Profile.findOne({
                user: req.user.id
            })
            .then(profile => {
                if (!profile) {
                    res.status(404).json({
                        usernotfound: "No users fouund",
                    });
                }
                const removethis = profile.workrole
                    .map(item => item.id)
                    .indexOf(req.params.w_id);
                profile.workrole.splice(removethis, 1);
                profile.save()
                    .then(profile => res.json(profile))
                    .catch(err => console.log(err));

            })
            .catch(err => console.log(err));
    });



module.exports = router;