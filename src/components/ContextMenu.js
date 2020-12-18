import React from 'react';

import classes from './ContextMenu.module.css';

const ContextMenu = ({ x, y, show }) => {
  const click = () => {
    console.log('aaaa');
  }

  return (
    <ul
      className={[classes.menu, !show ? classes.transition : ''].join(' ')}
      style={{ left: x, top: y }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <li onClick={click}>Editar</li>
      <li>Copiar</li>
      <li>Deletar</li>
    </ul>
  );
}

export default ContextMenu;
