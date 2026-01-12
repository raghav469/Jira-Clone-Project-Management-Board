import mongoose from 'mongoose';

const BoardSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title for this board.'],
        maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    lists: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'List',
    }],
}, { timestamps: true });

export default mongoose.models.Board || mongoose.model('Board', BoardSchema);
