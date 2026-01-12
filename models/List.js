import mongoose from 'mongoose';

const ListSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title for this list.'],
    },
    boardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Board',
        required: true,
    },
    order: {
        type: Number,
        required: true,
        default: 0,
    },
    cards: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Card',
    }],
}, { timestamps: true });

export default mongoose.models.List || mongoose.model('List', ListSchema);
