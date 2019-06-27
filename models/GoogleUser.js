const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const GoogleUserSchema = new Schema({

    googleId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    professor: {
        type: Boolean,
        default: false
    },
    classes: [
            {
            type: Schema.Types.ObjectId,
            ref: "classes"
        }
    ],
    createdAt: {
        type: Date,
        default: new Date()
    }

});

// The User model can have functions defined on it. This one is:
// User.testMethod()
GoogleUserSchema.methods.testMethod = () => {
    console.log('Using Schema Method');
};

// Exporting the User model so we can use it in other pages
module.exports = mongoose.model('googleusers', GoogleUserSchema);
