import { useState, useEffect, useCallback } from 'react';

const useContextMenu = (ref) => {
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const [show, setShow] = useState(false);
  const [manual, setManual] = useState(false);

  const handleClick = useCallback(() => {
    if(show) setShow(false);
  }, [show]);

  const handleEsc = useCallback((e) => {
    if(e.key === 'Escape') handleClick();
  }, [handleClick]);

  const showContextMenu = useCallback((x, y, m) => {
    setCoords({ x, y });
    setShow(true);
    setManual(m || false);
  }, []);

  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    showContextMenu(e.pageX, e.pageY)
  }, [showContextMenu]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEsc);
    ref.current.addEventListener('click', handleClick);
    ref.current.addEventListener('contextmenu', handleContextMenu);
    const r = ref.current;
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEsc);
      r.removeEventListener('click', handleClick);
      r.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [ref, handleClick, handleEsc, handleContextMenu]);

  return { x: coords.x, y: coords.y, show, manual, handleClick, showContextMenu };
}

export default useContextMenu;
