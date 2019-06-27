const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AttendanceCode = new Schema({
    
    class: {
        type: Schema.Types.ObjectId,
        ref: 'classes'
    },
    student: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    professor: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    code: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: new Date()
    }

});

// Exporting the User model so we can use it in other pages
module.exports = mongoose.model('attendanceCodes', AttendanceCode);
