import React from 'react';
import { Droppable } from 'react-beautiful-dnd';

import classes from './Box.module.css';

const Box = ({ id, disableDrop, children }) => {
  return (
    <Droppable droppableId={id} direction="horizontal" isDropDisabled={disableDrop}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          className={[
            classes.box,
            disableDrop ? classes.nodrop : ''
          ].join(' ')}
        >
          {children}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}

export default Box;
