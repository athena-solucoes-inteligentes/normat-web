import React, { useState } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { v4 as uuid } from 'uuid'
import Block from './components/Block';
import blocksJson from './blocks.json';

const App = () => {
  const [toolbar] = useState(blocksJson.list);
  const [blockLists, setBlockLists] = useState({});
  const [trash, setTrash] = useState(false);

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
  
    return result;
  };

  const onBeforeCapture = () => {
    setTrash(true);
  }

  const onDragEnd = (result) => {
    setTrash(false);
    const { source, destination } = result;
    if (!destination) return;

    if(source.droppableId === 'toolbar' && destination.droppableId !== source.droppableId) {
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
    } else if(destination.droppableId === 'toolbar' && destination.droppableId !== source.droppableId) {
      setBlockLists({
        ...blockLists,
        [source.droppableId]: blockLists[source.droppableId].filter((_, index) => index !== source.index),
      });
    } else if(source.droppableId !== 'toolbar' && destination.droppableId === source.droppableId) {
      setBlockLists({
        ...blockLists,
        [destination.droppableId]: reorder(blockLists[destination.droppableId], source.index, destination.index),
      });
    } else if(source.droppableId !== 'toolbar' && destination.droppableId !== 'toolbar' && destination.droppableId !== source.droppableId) {
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

    return (
      <DragDropContext onDragEnd={onDragEnd} onBeforeCapture={onBeforeCapture}>
        <Droppable droppableId="toolbar" direction="horizontal" isDropDisabled>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              style={{
                background: 'lightgrey',
                display: 'flex',
                padding: 8,
                overflow: 'auto',
                borderRadius: '5px',
                width: 700
              }}
            >
              {toolbar.map((item, index) => (
                <Block
                  key={item.name}
                  id={item.name}
                  name={item.name}
                  content={item.content}
                  index={index}
                  toolbar
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
        <Droppable droppableId="droppable2" direction="horizontal">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              style={{
                background: snapshot.isDraggingOver ? 'lightgrey' : 'lightgrey',
                display: 'flex',  
                padding: 8,
                overflow: 'auto',
                borderRadius: '5px',
              }}
              {...provided.droppableProps}
            >
              {blockLists["droppable2"] && blockLists["droppable2"].map((item, index) => {
                return (
                  <Block
                    key={item.id}
                    id={item.id}
                    name={item.name}
                    content={item.content}
                    index={index}
                  />
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
        <Droppable droppableId="droppable3" direction="horizontal">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              style={{
                background: snapshot.isDraggingOver ? 'lightgrey' : 'lightgrey',
                display: 'flex',  
                padding: 8,
                overflow: 'auto',
                borderRadius: '5px',
              }}
              {...provided.droppableProps}
            >
              {blockLists["droppable3"] && blockLists["droppable3"].map((item, index) => {
                return (
                  <Block
                    key={item.id}
                    id={item.id}
                    name={item.name}
                    content={item.content}
                    index={index}
                  />
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
        {trash && <Droppable droppableId="trash" direction="horizontal">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              style={{
                background: snapshot.isDraggingOver ? 'lightgrey' : 'lightgrey',
                display: 'flex',  
                padding: 8,
                overflow: 'auto',
                borderRadius: '5px',
              }}
              {...provided.droppableProps}
            >
              {provided.placeholder}
              <p>Lixo</p>
            </div>
          )}
        </Droppable>}
      </DragDropContext>
    );
}

export default App;