import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import Circle from './Circle';

import classes from './Box.module.css';

const Box = ({ id, disableDrop, children, title }) => {
  return (
    <Droppable droppableId={id} direction="horizontal" isDropDisabled={disableDrop}>
      {(provided, snapshot) => (
        <div className={classes.container} style={{padding: disableDrop ? '8px 0' : null}}>
          {!disableDrop && title && (
            <div className={classes.title}>
              <div>
                <Circle size={16} color="#fff" margin="0 5px" />
              </div>
              <p>{title}</p>
              <div className={classes.dots}>
                <Circle size={4} color="#fff" margin={2} />
                <Circle size={4} color="#fff" margin={2} />
                <Circle size={4} color="#fff" margin={2} />
              </div>
            </div>
          )}
          <div
            ref={provided.innerRef}
            className={[
              classes.box,
              disableDrop ? classes.nodrop : ''
            ].join(' ')}
            style={{
              borderRadius: disableDrop && !title ? 10 : null,
              width: disableDrop ? '100%' : null,
              justifyContent: disableDrop ? 'space-between' : null,
            }}
          >
            {children}
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  );
}

export default Box;
