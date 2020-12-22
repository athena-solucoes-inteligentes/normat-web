import React, { useRef } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import groups from '../constants/groups.json';

import useContextMenu from '../hooks/useContextMenu';

import classes from './Block.module.css';
import ContextMenu from './ContextMenu';

const Block = ({ id, name, group, content, index, toolbar }) => {
  const ref = useRef(null);
  const { x, y, show, handleClick } = useContextMenu(ref);
  return (
    <>
      <Draggable draggableId={id} index={index}>
        {(provided, snapshot) => (
          <div ref={ref}>
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className={classes.block}
              style={{
                background: groups[group].color,
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
          </div>
          )}
      </Draggable>
      {!toolbar && <ContextMenu x={x} y={y} show={show} handleClick={handleClick} list={[
        {
          title: 'Editar',
          click: () => console.log('teste'),
        },
        {
          title: 'Copiar',
          click: () => console.log('teste'),
        },
        {
          title: 'Deletar',
          click: () => console.log('teste'),
        },
      ]}/>}
    </>
  )
}

export default Block;
