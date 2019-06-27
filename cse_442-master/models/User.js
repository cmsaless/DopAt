const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({

    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
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
    },
    googleId: {
        type: String,
        default: null
    },
    pro: {
        type: Boolean,
        default: false
    }

});

// The User model can have functions defined on it. This one is:
// User.testMethod()
UserSchema.methods.testMethod = () => {
    console.log('Using Schema Method');
};

// Exporting the User model so we can use it in other pages
module.exports = mongoose.model('users', UserSchema);
