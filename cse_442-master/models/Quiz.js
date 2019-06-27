const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const QuizSchema = new Schema({

    class: {
        type: Schema.Types.ObjectId,
        ref: 'classes'
    },
    professor: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    question: {
        type: String,
        required: true
    },
    answers: [
        {
            type: String
        }
    ],
    open: {
        type: Boolean,
        required: true,
        default: false
    },
    
    date: {
        type: Date,
        default: new Date()
    }

});

// The User model can have functions defined on it. This one is:
// User.testMethod()
QuizSchema.methods.testMethod = () => {
    console.log('Using Schema Method');
};

// Exporting the User model so we can use it in other pages
module.exports = mongoose.model('quizzes', QuizSchema);
