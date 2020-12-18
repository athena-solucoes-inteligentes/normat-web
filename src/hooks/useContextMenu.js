import { useState, useEffect, useCallback } from 'react';

const useContextMenu = (ref) => {
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const [show, setShow] = useState(false);

  const handleClick = useCallback((e) => {
    if(show) setShow(false);
  }, [show]);

  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    setCoords({
      x: e.pageX,
      y: e.pageY
    });
    setShow(true);
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClick);
    ref.current.addEventListener("contextmenu", handleContextMenu);
    const r = ref.current;
    return () => {
      document.removeEventListener("mousedown", handleClick);
      r.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [ref, handleClick, handleContextMenu]);

  return { x: coords.x, y: coords.y, show };
}

export default useContextMenu;
