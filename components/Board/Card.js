'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function Card({ card }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: card._id,
        data: {
            type: 'Card',
            card,
        }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="card-item glass-panel"
        >
            <div className="card-title">{card.title}</div>
            {/* Add more details like assignees here later */}

            <style jsx>{`
        .card-item {
          padding: 1rem;
          margin-bottom: 0.75rem;
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid var(--glass-border);
          border-radius: 0.5rem;
          cursor: grab;
          user-select: none;
        }
        .card-item:hover {
          background: rgba(30, 41, 59, 0.8);
          border-color: var(--accent-color);
        }
        .card-title {
          font-weight: 500;
          color: var(--text-primary);
        }
      `}</style>
        </div>
    );
}
