import React, { useState, useCallback, useEffect } from 'react';

export const MenuContext = React.createContext({
  x: 0,
  y: 0,
  show: false,
  list: [],
  handleClick: () => {},
  showContextMenu: (x, y, m) => {},
  setList: (list) => {},
  handleContextMenu: (e) => {},
});

const MenuContextProvider = ({ children }) => {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [show, setShow] = useState(false);
  const [list, setList] = useState([]);

  const handleClick = useCallback(() => {
    if(show) setShow(false);
  }, [show]);

  const handleEsc = useCallback((e) => {
    if(e.key === 'Escape') handleClick();
  }, [handleClick]);

  const showContextMenu = useCallback((x, y) => {
    setCoords({ x, y });
    setShow(true);
  }, []);

  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    showContextMenu(e.pageX, e.pageY)
  }, [showContextMenu]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [handleClick, handleEsc, handleContextMenu]);


  return (
    <MenuContext.Provider value={{
      x: coords.x,
      y: coords.y,
      show,
      list,
      setList,
      handleClick,
      showContextMenu,
      handleContextMenu
    }}>
      {children}
    </MenuContext.Provider>
  );
};

export default MenuContextProvider;
