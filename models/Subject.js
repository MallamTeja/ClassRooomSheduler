const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    hoursPerWeek: {
        type: Number,
        required: true,
        min: 1,
        max: 10
    },
    assignedFaculty: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty'
    }],
    students: {
        type: Number,
        default: 30
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

subjectSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Subject', subjectSchema);