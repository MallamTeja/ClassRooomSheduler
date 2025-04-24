const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
    facultyId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    expertise: [{
        type: String,
        trim: true
    }],
    availability: {
        type: Map,
        of: [String]
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

facultySchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Faculty', facultySchema);