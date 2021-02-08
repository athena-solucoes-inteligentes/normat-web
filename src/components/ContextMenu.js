import React from 'react';
import { checkNested } from '../utils.js'
import classes from './ContextMenu.module.css';

const ContextMenu = ({ x, y, show, handleClick, list }) => (
  <ul
    className={[classes.menu, !show ? classes.transition : ''].join(' ')}
    style={{ left: x, top: y }}
    onMouseDown={(e) => e.stopPropagation()}
    onContextMenu={(e) => e.preventDefault()}
  >
    {list && list.map((item) => {
      if(checkNested(item, 'title'))
        return <li key={item.title} onMouseDown={(e) => {
          e.stopPropagation();
          item.click();
          handleClick();
        }}>{item.title}</li>;
      return null;
    })}
  </ul>
);

export default ContextMenu;
