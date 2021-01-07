import React from 'react';

import Block from './Block';

const List = React.memo(({ list, toolbar, boxId, deleteBlock }) => {
  return list.map((item, index) => (
    <Block
      key={toolbar ? item.name : item.id}
      id={toolbar ? item.name : item.id}
      editable={item.editable}
      input={item.input}
      edit={item.edit}
      deleteBlock={deleteBlock}
      boxId={boxId}
      name={item.name}
      group={item.group}
      content={item.content}
      index={index}
      toolbar={toolbar}
    />
  ))
});

export default List;
