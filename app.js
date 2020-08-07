const express = require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");

//bring all routes
const auth = require("./routes/api/auth");
const questions = require("./routes/api/questions");
const profile = require("./routes/api/profile");
const passport = require("passport");

const app = express();

//Middleware for Express(body-parser)
app.use(bodyparser.urlencoded({
    extended: false
}));
app.use(bodyparser.json());

//MongoDB configuration
const db = require("./setup/myurl").mongoURL;

//Attempt to connect to database
mongoose
    .connect(db, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    })
    .then(() => console.log("MongoDB connected  successfully."))
    .catch(err => console.log(err));

const port = process.env.PORT || 3000;

//passport middleware
app.use(passport.initialize());

//config forJwt strategy
require("./strategies/jsonwtStrategy")(passport);

//just for Testing -> route
app.get("/", (req, res) => {
    res.send("Hey there stackneverflow")
});

//actual routes
app.use("/api/auth", auth);

app.use("/api/questions", questions);

app.use("/api/profile", profile);


app.listen(port, () => {
    console.log(`App is running at ${port}`);
});