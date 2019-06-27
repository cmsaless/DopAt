const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const FinishedAttendance = new Schema({
    
    codeID: {
        type: Schema.Types.ObjectId,
        required: true
    },
    class: {
        type: Schema.Types.ObjectId,
        ref: 'classes'
    },
    professor: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    started: {
        type: Date,
        required: true
    },
    closed: {
        type: Date,
        default: new Date()
    },
    count: {
        type: Number,
        required: true
    }

});

// Exporting the User model so we can use it in other pages
module.exports = mongoose.model('finishedCodes', FinishedAttendance);
