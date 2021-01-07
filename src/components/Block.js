import React, { useRef } from 'react';
import { Draggable } from 'react-beautiful-dnd';

import useContextMenu from '../hooks/useContextMenu';
import ContextMenu from './ContextMenu';

import classes from './Block.module.css';
import groups from '../constants/groups.json';

const Block = ({ id, name, editable, edit, boxId, input, group, content, index, toolbar, deleteBlock }) => {
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
                // transition: snapshot.isDropAnimating
                // ? `all ${snapshot.dropAnimation.curve} 0.001s`
                // : provided.draggableProps.style.transition
              }}
            >
              {(editable && input) || content}
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
        editable && {
          title: 'Editar',
          click: () => edit(boxId, index, true),
        },
        {
          title: 'Copiar',
          click: () => {
            navigator.clipboard.writeText(JSON.stringify({blocks:[{name, input}]}));
          },
        },
        {
          title: 'Deletar',
          click: () => deleteBlock(boxId, index),
        },
      ]}/>}
    </>
  )
}

export default Block;
