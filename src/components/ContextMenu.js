import React from 'react';

import classes from './ContextMenu.module.css';

const ContextMenu = ({ x, y, show, handleClick, list }) => (
  <ul
    className={[classes.menu, !show ? classes.transition : ''].join(' ')}
    style={{ left: x, top: y }}
    onMouseDown={(e) => e.stopPropagation()}
    onContextMenu={(e) => e.preventDefault()}
    onClick={handleClick}
  >
    {list && list.map((item) => (
      <li key={item.title} onClick={item.click}>{item.title}</li>
    ))}
  </ul>
);

export default ContextMenu;
