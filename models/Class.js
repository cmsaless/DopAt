const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ClassSchema = new Schema({
    
    name: {
        type: String,
        required: true
    },
    professor: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    }

});

// The User model can have functions defined on it. This one is:
// User.testMethod() 
ClassSchema.methods.testMethod = () => {
    console.log('Using Schema Method');
};

// Exporting the User model so we can use it in other pages
module.exports = mongoose.model('classes', ClassSchema);
