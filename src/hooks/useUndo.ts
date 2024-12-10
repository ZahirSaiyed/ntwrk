import { useState } from 'react';

export function useUndo<T>(initialPresent: T) {
  const [past, setPast] = useState<T[]>([]);
  const [present, setPresent] = useState<T>(initialPresent);
  const [future, setFuture] = useState<T[]>([]);

  const undo = () => {
    if (past.length === 0) return;
    
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    
    setPast(newPast);
    setPresent(previous);
    setFuture([present, ...future]);
  };

  const redo = () => {
    if (future.length === 0) return;
    
    const next = future[0];
    const newFuture = future.slice(1);
    
    setPast([...past, present]);
    setPresent(next);
    setFuture(newFuture);
  };

  const saveState = (newPresent: T) => {
    setPast([...past, present]);
    setPresent(newPresent);
    setFuture([]);
  };

  return { past, present, future, undo, redo, saveState };
} 