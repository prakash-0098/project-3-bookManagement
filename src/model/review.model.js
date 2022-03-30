const mongoose = require('mongoose'); 

const reviewSchema = new mongoose.Schema({
    bookId:{
        type: mongoose.Types.ObjectId,
        refs: 'Book',
        required: [true, 'The bookId field is required'],
        trim: true
    },
    reviewedBy:{
        type: String,
        default: 'Guest',
        trim: true
    },
    reviewedAt: {
        type: Date,
        required: [true, 'The reviewedAt field is required'],
    },
    rating:{
        type: Number,
        min: [1, 'Minimum rating is 1'],
        max: [5, 'Maximum rating is 5'],
        required: [true, 'The rating field is required'],
    },
    review: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true  
}); 

module.exports = mongoose.model('Review', reviewSchema); 