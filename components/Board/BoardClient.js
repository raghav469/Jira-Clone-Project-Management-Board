'use client';

import { useState, useEffect } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import List from './List';
import Card from './Card';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BoardClient({ board }) {
    const [lists, setLists] = useState(board.lists || []);
    const [activeId, setActiveId] = useState(null);
    const [activeItem, setActiveItem] = useState(null); // List or Card object
    const router = useRouter();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Helper to find list by card id
    function findListId(cardId) {
        if (lists.find(l => l._id === cardId)) return cardId; // It's a list
        const list = lists.find((l) => l.cards.find((c) => c._id === cardId));
        return list ? list._id : null;
    }

    function handleDragStart(event) {
        const { active } = event;
        const { data } = active;
        setActiveId(active.id);
        setActiveItem(data.current?.card || data.current?.list);
    }

    function handleDragOver(event) {
        const { active, over } = event;
        const overId = over?.id;

        if (!overId || active.id === overId) return;

        const isActiveCard = active.data.current?.type === 'Card';
        const isOverCard = over.data.current?.type === 'Card';
        const isOverList = over.data.current?.type === 'List';

        if (!isActiveCard) return; // Only cards move between lists in dragOver

        // Find the containers
        const activeListId = findListId(active.id);
        const overListId = findListId(overId);

        if (!activeListId || !overListId) return;

        if (activeListId !== overListId) {
            setLists((prev) => {
                const activeListIndex = prev.findIndex((l) => l._id === activeListId);
                const overListIndex = prev.findIndex((l) => l._id === overListId);

                if (activeListIndex === -1 || overListIndex === -1) return prev;

                const activeList = prev[activeListIndex];
                const overList = prev[overListIndex];

                // Find index in active list
                const activeIndex = activeList.cards.findIndex(c => c._id === active.id);
                // Find index in over list (if hovering over card)
                let overIndex;
                if (isOverCard) {
                    overIndex = overList.cards.findIndex(c => c._id === overId);
                    const isBelowOverItem =
                        over &&
                        active.rect.current.translated &&
                        active.rect.current.translated.top >
                        over.rect.top + over.rect.height;
                    const modifier = isBelowOverItem ? 1 : 0;
                    overIndex = overIndex >= 0 ? overIndex + modifier : overList.cards.length + 1;
                } else {
                    overIndex = overList.cards.length + 1;
                }

                // Clone
                const newLists = [...prev];
                const newActiveList = { ...activeList, cards: [...activeList.cards] };
                const newOverList = { ...overList, cards: [...overList.cards] };

                // Move
                const [movedCard] = newActiveList.cards.splice(activeIndex, 1);
                movedCard.listId = overListId; // Update local ref
                newOverList.cards.splice(overIndex, 0, movedCard);

                newLists[activeListIndex] = newActiveList;
                newLists[overListIndex] = newOverList;

                return newLists;
            });
        }
    }

    function handleDragEnd(event) {
        const { active, over } = event;
        const activeId = active.id;
        const overId = over?.id;

        if (!overId) {
            setActiveId(null);
            setActiveItem(null);
            return;
        }

        const isActiveList = active.data.current?.type === 'List';
        const isActiveCard = active.data.current?.type === 'Card';

        if (isActiveList && activeId !== overId) {
            setLists((items) => {
                const oldIndex = items.findIndex((l) => l._id === activeId);
                const newIndex = items.findIndex((l) => l._id === overId);
                const newLists = arrayMove(items, oldIndex, newIndex);

                // Trigger API update
                saveOrder(newLists);
                return newLists;
            });
        }

        if (isActiveCard) {
            // DragOver handled moving between lists. DragEnd handles reordering within same list OR final commit.
            // If we moved between lists in DragOver, we just need to commit the state to DB.

            const activeListId = findListId(activeId);
            const overListId = findListId(overId);

            if (activeListId) {
                const listIndex = lists.findIndex(l => l._id === activeListId);
                const list = lists[listIndex];
                const oldIndex = list.cards.findIndex(c => c._id === activeId);
                const newIndex = list.cards.findIndex(c => c._id === overId);

                if (oldIndex !== newIndex) {
                    // Reorder in same list
                    setLists(prev => {
                        const newLists = [...prev];
                        const newList = { ...newLists[listIndex], cards: arrayMove(newLists[listIndex].cards, oldIndex, newIndex) };
                        newLists[listIndex] = newList;
                        saveOrder(newLists);
                        return newLists;
                    });
                } else {
                    // Moved physically (dragOver) but index matches? OR Just dropped.
                    // We should save to DB regardless if we moved lists.
                    // How to detect if dirty? We optimistically updated `lists`.
                    // We'll just save the current state of involved lists.
                    saveOrder(lists);
                }
            }
        }

        setActiveId(null);
        setActiveItem(null);
    }

    async function saveOrder(currentLists) {
        // Prepare payload: array of { id, cards: [cardIds] }
        // This matches our batch API
        const payload = {
            lists: currentLists.map(l => ({
                id: l._id,
                cards: l.cards.map(c => c._id)
            }))
        };

        try {
            await fetch('/api/lists/batch', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch (err) {
            console.error("Failed to save order", err);
        }
    }

    async function handleAddCard(listId, title) {
        // Optimistic
        const tempId = Date.now().toString();
        const newCard = { _id: tempId, title, listId };

        setLists(prev => prev.map(l => {
            if (l._id === listId) {
                return { ...l, cards: [...l.cards, newCard] };
            }
            return l;
        }));

        try {
            const res = await fetch('/api/cards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, listId, boardId: board._id })
            });
            const savedCard = await res.json();

            // Replace temp card
            setLists(prev => prev.map(l => {
                if (l._id === listId) {
                    return { ...l, cards: l.cards.map(c => c._id === tempId ? savedCard : c) };
                }
                return l;
            }));
        } catch (err) {
            console.error(err);
            // Revert?
        }
    }

    async function handleAddList() {
        const title = prompt("List Title:");
        if (!title) return;

        const tempId = Date.now().toString();
        const newList = { _id: tempId, title, cards: [] };

        setLists(prev => [...prev, newList]);

        try {
            const res = await fetch('/api/lists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, boardId: board._id })
            });
            const savedList = await res.json();
            setLists(prev => prev.map(l => l._id === tempId ? savedList : l));
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="board-layout">
                <SortableContext items={lists.map(l => l._id)} strategy={horizontalListSortingStrategy}>
                    {lists.map(list => (
                        <List
                            key={list._id}
                            list={list}
                            cards={list.cards}
                            onAddCard={handleAddCard}
                        />
                    ))}
                </SortableContext>

                <button className="add-list-btn" onClick={handleAddList}>
                    <Plus /> Add List
                </button>
            </div>

            <DragOverlay>
                {activeId ? (
                    activeItem && activeItem.cards ? (
                        <div className="proxy-list">{activeItem.title}</div>
                    ) : (
                        <div className="proxy-card">{activeItem?.title}</div>
                    )
                ) : null}
            </DragOverlay>

            <style jsx>{`
         .board-layout {
           display: flex;
           gap: 1rem;
           overflow-x: auto;
           padding-bottom: 1rem;
           height: calc(100vh - 120px);
           align-items: flex-start;
         }
         .add-list-btn {
           min-width: 300px;
           padding: 1rem;
           background: rgba(255,255,255,0.1);
           border: 1px dashed var(--glass-border);
           border-radius: 0.75rem;
           color: var(--text-secondary);
           display: flex;
           align-items: center;
           gap: 0.5rem;
           cursor: pointer;
         }
         .add-list-btn:hover {
           background: rgba(255,255,255,0.15);
           color: white;
         }
         .proxy-card {
           padding: 1rem;
           background: var(--bg-secondary);
           border: 1px solid var(--accent-color);
           border-radius: 0.5rem;
           color: white;
           box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
         }
         .proxy-list {
            padding: 1rem;
            background: var(--bg-secondary);
            border-radius: 0.75rem;
            width: 300px;
            color: white;
            border: 1px solid var(--accent-color);
         }
      `}</style>
        </DndContext>
    );
}
