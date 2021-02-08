import React, { useRef, useContext } from 'react';
import { Droppable } from 'react-beautiful-dnd';

import Circle from './Circle';
import { MenuContext } from '../context/MenuContext';

import classes from './Box.module.css';

const Box = ({
  id,
  list,
  disableDrop,
  children,
  title,
  customClass,
  pasteBlocks,
  clearBox,
  deleteBox,
  dragHandleProps,
  connectDragSource,
  connectDragPreview,
}) => {
  const dotRef = useRef(null);
  const { /* showContextMenu, */ setList, handleContextMenu } = useContext(MenuContext);

  const updateList = (manual) => {
    setList([
      // manual && {
      //   title: 'Renomear',
      //   click: () => pasteBlocks(id),
      // },
      manual && {
        title: 'Copiar',
        click: () => {
          if(!list) return;
          const clipboard = {
            title,
            list: list.map(b => ({name: b.name, input: b.input}))
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
    ]);
  }

  const openContextMenu = (e, manual) => {
    e.stopPropagation();
    if(id === 'toolbar' || id === 'trash') return;
    updateList(manual);
    handleContextMenu(e);
  }

  // const showMenu = (e) => {
  //   if(id === 'toolbar' || id === 'trash') return;
  //   updateList(true);
  //   showContextMenu(dotRef.current.offsetLeft, dotRef.current.offsetTop + dotRef.current.offsetWidth / 2);
  // }

  const getBox = (provided) => (
    <div className={classes.container} style={{padding: disableDrop ? '8px 0' : null}} >
      {!disableDrop && title && connectDragSource((
        <div className={classes.title} {...dragHandleProps}>
          <div>
            <Circle size={16} color="#fff" margin="0 5px" />
          </div>
          <p>{title}</p>
          <div ref={dotRef} className={classes.dots} onClick={(e) => openContextMenu(e, true)}>
            <Circle size={4} color="#fff" margin={2} />
            <Circle size={4} color="#fff" margin={2} />
            <Circle size={4} color="#fff" margin={2} />
          </div>
        </div>
      ), { dropEffect: 'move' })}
      <div onContextMenu={openContextMenu} style={{width: 'inherit', display: 'flex', justifyContent: 'center'}}>
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
  );

  return (
    <Droppable droppableId={id} direction="horizontal" isDropDisabled={disableDrop} type="BLOCK">
      {(provided, snapshot) => connectDragPreview ? connectDragPreview(getBox(provided)) : getBox(provided)}
    </Droppable>
  );
}

export default Box;
