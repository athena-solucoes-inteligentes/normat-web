import React, { useState } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { v4 as uuid } from 'uuid'
import Block from './components/Block';
import blocksJson from './blocks.json';

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const App = () => {
  const [toolbar, setToolbar] = useState(blocksJson.list);
  const [blockLists, setBlockLists] = useState({
    droppable2: []
  });

  const onDragEnd = (result) => {
    const { source, destination } = result;
    // dropped outside the list
    if (!destination) return;

    if(source.droppableId === 'toolbar' && destination.droppableId !== source.droppableId) {
      setBlockLists({
        ...blockLists,
        [destination.droppableId]: [
          ...blockLists[destination.droppableId],
          toolbar[source.index]
        ]
      });
    }

    // const items = reorder(
    //   itemList,
    //   result.source.index,
    //   result.destination.index
    // );

    // setItemList(items);
  }

  // Normally you would want to split things out into separate components.
  // But in this example everything is just done in one place for simplicity
    return (
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="toolbar" direction="horizontal">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              style={{
                background: snapshot.isDraggingOver ? 'lightgrey' : 'lightgrey',
                display: 'flex',  
                padding: 8,
                overflow: 'auto',
                borderRadius: '5px',
                justifyContent: 'center',
                alignItems: 'center'
              }}
              {...provided.droppableProps}
            >
              {toolbar.map((item, index) => {
                const id = uuid();
                return <Block key={id} id={id} name={item.name} content={item.content} index={index} />
              })}
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
                justifyContent: 'center',
                alignItems: 'center'
              }}
              {...provided.droppableProps}
            >
              {blockLists["droppable2"].map((item, index) => {
                const id = uuid();
                return <Block key={id} id={id} name={item.name} content={item.content} index={index} />
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
}

export default App;