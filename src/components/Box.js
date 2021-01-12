import React, { useRef } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import Circle from './Circle';

import useContextMenu from '../hooks/useContextMenu';
import ContextMenu from './ContextMenu';

import classes from './Box.module.css';

const Box = ({ id, list, disableDrop, children, title, customClass, pasteBlocks, clearBox, deleteBox, dragHandleProps, boxes }) => {
  const ref = useRef(null);
  const dotRef = useRef(null);
  const { x, y, show, manual, handleClick, showContextMenu } = useContextMenu(ref);

  const showMenu = () => {
    showContextMenu(dotRef.current.offsetLeft, dotRef.current.offsetTop + dotRef.current.offsetWidth / 2, true);
  }

  return (
    <>
      <Droppable droppableId={id} direction="horizontal" isDropDisabled={disableDrop} type="BLOCK">
        {(provided, snapshot) => (
          <div className={classes.container} style={{padding: disableDrop ? '8px 0' : null}} >
            {!disableDrop && title && (
              <div className={classes.title} {...dragHandleProps}>
                <div>
                  <Circle size={16} color="#fff" margin="0 5px" />
                </div>
                <p>{title}</p>
                <div ref={dotRef} className={classes.dots} onClick={showMenu}>
                  <Circle size={4} color="#fff" margin={2} />
                  <Circle size={4} color="#fff" margin={2} />
                  <Circle size={4} color="#fff" margin={2} />
                </div>
              </div>
            )}
            <div ref={ref} style={{width: 'inherit', display: 'flex', justifyContent: 'center'}}>
              <div
                ref={provided.innerRef}
                className={[
                  classes.box,
                  disableDrop || !title ? classes.nodrop : '',
                  customClass
                ].join(' ')}
                style={{
                  borderRadius: disableDrop || !title ? 10 : null,
                  width: disableDrop ? '100%' : null,
                  justifyContent: disableDrop ? 'center' : null,
                }}
              >
                {children}
                {provided.placeholder}
              </div>
            </div>
          </div>
        )}
      </Droppable>
      {id !== 'toolbar' && id !== 'trash' && (
        <Droppable droppableId={`${id};${title}`} direction="horizontal" type="BOX">
          {(provided, snapshot) => (
            <div style={{ width: '100%', height: 100, border: '1px solid black' }}>
              <div ref={provided.innerRef}>
                {Object.keys(boxes).map(boxId => (
                  <Box
                    id={boxId}
                    key={boxId}
                    title={boxes[boxId].title}
                    boxes={boxes[boxId].children}
                    pasteBlocks={pasteBlocks}
                    deleteBox={deleteBox}
                    clearBox={clearBox}
                    list={boxes[boxId].list}
                  />
                ))}
                {provided.placeholder}
              </div>
            </div>
          )}
        </Droppable>
      )}
      {id !== 'toolbar' && id !== 'trash' && (
        <ContextMenu x={x} y={y} show={show} handleClick={handleClick} list={[
          manual && {
            title: 'Renomear',
            click: () => pasteBlocks(id),
          },
          manual && {
            title: 'Copiar',
            click: () => {
              if(typeof(list) === 'undefined') return;
              const clipboard = {
                title,
                blocks: list.map(b => ({name: b.name, input: b.input}))
              };
              navigator.clipboard.writeText(JSON.stringify(clipboard));
            },
          },
          {
            title: 'Colar bloco(s)',
            click: () => pasteBlocks(id),
          },
          manual && {
            title: 'Limpar',
            click: () => clearBox(id),
          },
          manual && {
            title: 'Deletar',
            click: () => deleteBox(id),
          },
        ]}/>
      )}
    </>
  );
}

export default Box;
