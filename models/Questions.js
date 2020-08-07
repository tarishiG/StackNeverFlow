const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QuestionSchema = new Schema({
    user: {
        //ancor
        type: Schema.Types.ObjectId,
        ref: "myperson"
    },
    textone: {
        type: String,
        required: true
    },
    texttwo: {
        type: String,
        required: true
    },
    name: {
        type: String
    },
    upvotes: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: "myperson"
        }
    }],
    answers: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: "myperson"
        },
        text: {
            type: String,
            required: true
        },
        name: {
            type: String
        },
        date: {
            type: Date,
            default: Date.now
        }
    }],
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = Questions = mongoose.model("myquestions", QuestionSchema);