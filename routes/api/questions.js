const express = require("express");
const router = express.Router();
const passport = require("passport");
const mongoose = require("mongoose");


//Load Person model
const Person = require("../../models/Person");

//Load Profile model
const Profile = require("../../models/Profile");

//Load Questions model 
const Questions = require("../../models/Questions");

//@type    GET
//@route   /api/questions
//@desc    route for displaying all questions
//@access  PUBLIC
router.get("/", (req, res) => {
    Questions.find()
        .sort({
            date: "desc"
        })
        .then(questions => res.json(questions))
        .catch(err => res.json({
            noquestions: "No questions to display"
        }));
});

//@type    POST
//@route   /api/questions
//@desc    route for submitting questions
//@access  PRIVATE
router.post("/", passport.authenticate("jwt", {
    session: false
}), (req, res) => {
    const newQuestion = new Questions({
        textone: req.body.textone,
        texttwo: req.body.texttwo,
        user: req.user.id,
        name: req.body.name
    });
    newQuestion.save()
        .then(question => res.json(question))
        .catch(err => console.log("Unable to push question to database"));
});

//@type    POST
//@route   /api/answers/:id
//@desc    route for submitting answers to questions
//@access  PRIVATE
router.post("/answers/:id", passport.authenticate("jwt", {
    session: false
}), (req, res) => {
    Questions.findById(req.params.id)
        .then(question => {
            const newAnswer = {
                user: req.user.id,
                name: req.body.name,
                text: req.body.text
            };
            question.answers.unshift(newAnswer);
            question.save()
                .then(question => res.json(question))
                .catch(err => console.log(err));
        })
        .catch(err => console.log(MediaStreamError));
});

//@type    POST
//@route   /api/questions/upvote/:id
//@desc    route for upvoting questions
//@access  PRIVATE
router.post("/upvote/:id", passport.authenticate("jwt", {
    session: false
}), (req, res) => {
    Profile.findOne({
            user: req.user.id
        })
        .then(profile => {
            Questions.findById(req.params.id)
                .then(question => {
                    if (question.upvotes.filter(upvote => upvote.user.toString() === req.user.id.toString()).length > 0) {
                        question.upvotes.shift({
                            user: req.user.id
                        });
                        question.save()
                            .then(question => res.json(question))
                            .catch(err => console.log(err));
                    } else {
                        question.upvotes.unshift({
                            user: req.user.id
                        });
                        question.save()
                            .then(question => res.json(question))
                            .catch(err => console.log(err));
                    }
                })
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
});


module.exports = router;