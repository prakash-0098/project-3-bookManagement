const mongoose = require('mongoose'); 
const uniqueValidator = require('mongoose-unique-validator');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'The title field is required'],
        unique: true,
        trim: true
    },
    excerpt: {
        type: String,
        required: [true, 'The excerpt field is required'],
        trim: true
    },
    userId: {
        type: mongoose.Types.ObjectId,
        refs: 'User',
        required: [true, 'The userId field is required'],
        trim: true
    },
    ISBN: {
        type: String,
        required: [true, 'The ISBN field is required'],
        unique: true,
        trim: true
    },
    category: {
        type: String,
        required: [true, 'The category field is required'],
        trim: true
    },
    subcategory: {
        type: [String],
        required: [true, 'The subcategory field is required'],
        trim: true
    },
    reviews: {
        type: Number,
        default: 0  //discuss
    },
    deletedAt: {
        type: Date,
        default: null
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    releasedAt: {
        type: Date,
        required: [true, 'The releasedAt field is required'] //check format("YYYY-MM-DD")
    }

}, {
    timestamps: true
}); 

uniqueValidator.defaults.message = 'The {PATH} is already registered !'
bookSchema.plugin(uniqueValidator);
/**
 * Add new property in book schema as releasedAt, which update its type String instead of Date
 */
bookSchema.add({releasedAt: String});

module.exports = mongoose.model('Book', bookSchema); 
