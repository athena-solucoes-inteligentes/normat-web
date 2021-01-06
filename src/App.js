import React, { useEffect } from 'react';

import Routes from './routes';

const App = () => {
  const handleContextMenu = (e) => e.preventDefault();
  useEffect(() => {
    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, [])
  return <Routes />;
};

export default App;
