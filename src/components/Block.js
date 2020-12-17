import React from 'react';
import { Draggable } from 'react-beautiful-dnd';

import classes from './Block.module.css';

const Block = ({ id, name, content, index, toolbar }) => {
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
                            background: snapshot.isDragging ? '#3498db' : '#2980b9',

                            // styles we need to apply on draggables
                            ...provided.draggableProps.style,
                        }}
                    >
                        {content}
                    </div>
                    {toolbar && snapshot.isDragging && (
                        <div className={classes.block} style={{ background: '#2980b9' }}>
                            {content}
                        </div>
                    )}
                </>
            )}
        </Draggable>
    )
}

export default Block;