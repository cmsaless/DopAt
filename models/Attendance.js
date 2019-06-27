const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AttendanceSchema = new Schema({

  code: {
        type: Schema.Types.ObjectId,
        ref: 'attendancecodes'
  },
  student: {
      type: Schema.Types.ObjectId,
      ref: 'users'
  },
    date: {
      type: Date,
      default: new Date()
    },
    class: {
        type: Schema.Types.ObjectId,
        ref: 'classes'
    }

});

// Exporting the User model so we can use it in other pages
module.exports = mongoose.model('attendances', AttendanceSchema);
