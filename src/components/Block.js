import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import groups from '../constants/groups.json';

import classes from './Block.module.css';

const Block = ({ id, name, group, content, index, toolbar }) => {
  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <>
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={classes.block}
            style={{
              background: groups[group].color,
              // styles we need to apply on draggables
              ...provided.draggableProps.style,
              transform: toolbar && !snapshot.isDragging
                ? 'translate(0px, 0px)'
                : provided.draggableProps.style.transform,
            }}
          >
            {content}
          </div>
          {toolbar && snapshot.isDragging && (
            <div className={classes.block} style={{ background: groups[group].color }}>
              {content}
            </div>
          )}
        </>
      )}
    </Draggable>
  )
}

export default Block;
