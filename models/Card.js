import mongoose from 'mongoose';

const CardSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title for this card.'],
    },
    description: {
        type: String,
    },
    listId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'List',
        required: true,
    },
    order: {
        type: Number,
        required: true,
        default: 0,
    },
    assignees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
}, { timestamps: true });

export default mongoose.models.Card || mongoose.model('Card', CardSchema);
