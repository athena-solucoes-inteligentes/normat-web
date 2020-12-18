import React, { useState } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { v4 as uuid } from 'uuid'

import Box from './Box';
import Button from './Button';
import List from './List';

import blocksJson from '../constants/blocks.json';
import classes from './DragArea.module.css';

const DragArea = () => {

  const [toolbar] = useState(blocksJson.list);
  const [blockLists, setBlockLists] = useState({});
  const [trash, setTrash] = useState(false);

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  const onBeforeCapture = () => setTrash(true);

  const onDragEnd = (result) => {
    setTrash(false);
    const { source, destination } = result;
    if (!destination) return;

    if (source.droppableId === 'toolbar' && destination.droppableId !== source.droppableId) {
      const dest = [
        ...blockLists[destination.droppableId] || [],
        {
        ...toolbar[source.index],
        id: `${toolbar[source.index].name}-${uuid()}`
        }
      ];
      setBlockLists({
        ...blockLists,
        [destination.droppableId]: reorder(dest, dest.length - 1, destination.index),
      });
    } else if (destination.droppableId === 'toolbar' && destination.droppableId !== source.droppableId) {
      setBlockLists({
        ...blockLists,
        [source.droppableId]: blockLists[source.droppableId].filter((_, index) => index !== source.index),
      });
    } else if (source.droppableId !== 'toolbar' && destination.droppableId === source.droppableId) {
      setBlockLists({
        ...blockLists,
        [destination.droppableId]: reorder(blockLists[destination.droppableId], source.index, destination.index),
      });
    } else if (source.droppableId !== 'toolbar' && destination.droppableId !== 'toolbar' && destination.droppableId !== source.droppableId) {
      const dest = [
        ...blockLists[destination.droppableId] || [],
        blockLists[source.droppableId][source.index],
      ];
      setBlockLists({
        ...blockLists,
        [destination.droppableId]: reorder(dest, dest.length - 1, destination.index),
        [source.droppableId]: blockLists[source.droppableId].filter((_, index) => index !== source.index),
      });
    }
  }

  const addBox = () => {
    setBlockLists({
      ...blockLists,
      [uuid()]: []
    })
  }

  return (
    <div className={classes.container}>
      <DragDropContext onDragEnd={onDragEnd} onBeforeCapture={onBeforeCapture}>
        <div className={classes.boxes}>
          <Box id="toolbar" disableDrop>
            <List list={toolbar} toolbar />
          </Box>
        </div>
        <div className={classes.boxes} style={{minHeight: '50%' }}>
          <Button text="Adicionar Caixa" onClick={addBox} />
          {Object.keys(blockLists).filter(blockId => blockId !== 'trash').map(blockId => (
            <Box id={blockId} key={blockId}>
              <List list={blockLists[blockId]} />
            </Box>
          ))}
          {trash && (
            <Box id="trash">
              <p>Lixo</p>
            </Box>
          )}
        </div>
      </DragDropContext>
    </div>
  )
}

export default DragArea;
