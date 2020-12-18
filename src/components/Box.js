import React from 'react';
import { Droppable } from 'react-beautiful-dnd';

const Box = ({ id, disableDrop, children }) => {
    return (
        <Droppable droppableId={id} direction="horizontal" isDropDisabled={disableDrop}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              style={{
                background: '#e7eef0',
                display: 'flex',
                padding: 8,
                overflow: 'auto',
                borderRadius: '5px',
                width: "100%",
              }}
            >
              {children}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
    );
}

export default Box;