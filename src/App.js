import React, { useEffect, useContext } from 'react';

import Routes from './routes';
import ContextMenu from './components/ContextMenu';
import { MenuContext } from './context/MenuContext';

const App = () => {
  const handleContextMenu = (e) => e.preventDefault();
  useEffect(() => {
    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, []);

  const { x, y, show, list, handleClick } = useContext(MenuContext);
  return (
    <>
      <ContextMenu x={x} y={y} show={show} handleClick={handleClick} list={list}/>
      <Routes />
    </>
  );
};

export default App;
