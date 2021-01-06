import React, { useRef } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import Circle from './Circle';

import useContextMenu from '../hooks/useContextMenu';
import ContextMenu from './ContextMenu';

import classes from './Box.module.css';

const Box = ({ id, disableDrop, children, title, customClass, pasteBlocks }) => {
  const ref = useRef(null);
  const dotRef = useRef(null);
  const { x, y, show, manual, handleClick, showContextMenu } = useContextMenu(ref);

  const showMenu = () => {
    showContextMenu(dotRef.current.offsetLeft, dotRef.current.offsetTop + dotRef.current.offsetWidth / 2, true);
  }

  return (
    <>
      <Droppable droppableId={id} direction="horizontal" isDropDisabled={disableDrop}>
        {(provided, snapshot) => (
          <div className={classes.container} style={{padding: disableDrop ? '8px 0' : null}}>
            {!disableDrop && title && (
              <div className={classes.title}>
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
                  justifyContent: disableDrop ? 'space-between' : null,
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
        <ContextMenu x={x} y={y} show={show} handleClick={handleClick} list={[
          manual && {
            title: 'Renomear',
            click: () => pasteBlocks(id),
          },
          {
            title: 'Colar bloco(s)',
            click: () => pasteBlocks(id),
          },
          manual && {
            title: 'Deletar',
            click: () => pasteBlocks(id),
          },
        ]}/>
      )}
    </>
  );
}

export default Box;
