'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import Card from './Card';
import { Plus } from 'lucide-react';
import { useState } from 'react';

export default function List({ list, cards, onAddCard }) {
    const [isAdding, setIsAdding] = useState(false);
    const [newCardTitle, setNewCardTitle] = useState('');

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: list._id,
        data: {
            type: 'List',
            list,
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
            className="list-container"
        >
            <div className="list-header" {...attributes} {...listeners}>
                <h3>{list.title}</h3>
                <span className="card-count">{cards.length}</span>
            </div>

            <div className="list-content">
                <SortableContext items={cards.map(c => c._id)} strategy={verticalListSortingStrategy}>
                    {cards.map(card => (
                        <Card key={card._id} card={card} />
                    ))}
                </SortableContext>
            </div>

            <div className="list-footer">
                {isAdding ? (
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (newCardTitle.trim()) {
                                if (onAddCard) onAddCard(list._id, newCardTitle);
                                setNewCardTitle('');
                                setIsAdding(false);
                            }
                        }}
                        className="add-card-form"
                    >
                        <input
                            autoFocus
                            value={newCardTitle}
                            onChange={e => setNewCardTitle(e.target.value)}
                            placeholder="Card title..."
                        />
                        <div className="flex gap-2">
                            <button type="submit" className="btn-sm confirm">Add</button>
                            <button type="button" onClick={() => setIsAdding(false)} className="btn-sm cancel">X</button>
                        </div>
                    </form>
                ) : (
                    <button className="add-card-btn" onClick={() => setIsAdding(true)}>
                        <Plus size={16} /> Add Card
                    </button>
                )}
            </div>

            <style jsx>{`
        .list-container {
          background: #1e293b;
          width: 300px;
          min-width: 300px;
          border-radius: 0.75rem;
          display: flex;
          flex-direction: column;
          max-height: 100%;
          border: 1px solid var(--glass-border);
        }
        .list-header {
          padding: 1rem;
          font-weight: 600;
          color: white;
          cursor: grab;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--glass-border);
        }
        .card-count {
           background: rgba(255,255,255,0.1);
           padding: 0.1rem 0.5rem;
           border-radius: 1rem;
           font-size: 0.8rem;
        }
        .list-content {
          padding: 0.5rem;
          flex: 1;
          overflow-y: auto;
          min-height: 50px; /* Drop zone */
        }
        .list-footer {
          padding: 0.5rem;
        }
        .add-card-btn {
          width: 100%;
          padding: 0.5rem;
          text-align: left;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .add-card-btn:hover {
          background: rgba(255,255,255,0.05);
          color: white;
        }
        .add-card-form input {
           margin-bottom: 0.5rem;
        }
        .btn-sm {
           padding: 0.25rem 0.5rem;
           border-radius: 0.25rem;
           border: none;
           cursor: pointer;
           font-size: 0.8rem;
        }
        .confirm { background: var(--accent-color); color: white; }
        .cancel { background: transparent; color: #94a3b8; }
      `}</style>
        </div>
    );
}
