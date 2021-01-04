import React, { useState } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { v4 as uuid } from 'uuid'

import Box from './Box';
import Button from './Button';
import List from './List';
import Modal from './Modal';

import blocksJson from '../constants/blocks.json';
import classes from './DragArea.module.css';

const DragArea = () => {
  const [blockLists, setBlockLists] = useState({
    trash: {
      list: []
    }
  });
  const [trash, setTrash] = useState(false);
  const [modal, setModal] = useState({
    box: false,
    block: {
      show: false,
      box: '',
      index: -1
    },
  });
  const [modalInfo, setModalInfo] = useState('');

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  const onBeforeCapture = () => {
    const { box, index, show } = modal.block;
    if(show) toggleBlockModal(box, index);
    setTrash(true);
  }

  const onDragEnd = (result) => {
    setTrash(false);
    const { source, destination } = result;
    if (!destination) return;

    if (source.droppableId === 'toolbar' && destination.droppableId !== source.droppableId) {
      const id = `${blocksJson.list[source.index].name}-${uuid()}`;
      const dest = [
        ...blockLists[destination.droppableId].list,
        {
          ...blocksJson.list[source.index],
          id
        }
      ];
      setBlockLists({
        ...blockLists,
        [destination.droppableId]: {
          ...blockLists[destination.droppableId],
          list: reorder(dest, dest.length - 1, destination.index)
        },
      });
      if(blocksJson.list[source.index].editable && destination.droppableId !== 'trash')
        toggleBlockModal(destination.droppableId, destination.index);
    } else if (destination.droppableId === 'toolbar' && destination.droppableId !== source.droppableId) {
      setBlockLists({
        ...blockLists,
        [source.droppableId]: {
          ...blockLists[source.droppableId],
          list: blockLists[source.droppableId].list.filter((_, index) => index !== source.index),
        },
      });
    } else if (source.droppableId !== 'toolbar' && destination.droppableId === source.droppableId) {
      setBlockLists({
        ...blockLists,
        [destination.droppableId]: {
          ...blockLists[destination.droppableId],
          list: reorder(blockLists[destination.droppableId].list, source.index, destination.index),
        },
      });
    } else if (source.droppableId !== 'toolbar' && destination.droppableId !== 'toolbar' && destination.droppableId !== source.droppableId) {
      const dest = [
        ...blockLists[destination.droppableId].list,
        blockLists[source.droppableId].list[source.index],
      ];
      setBlockLists({
        ...blockLists,
        [destination.droppableId]: {
          ...blockLists[destination.droppableId],
          list: reorder(dest, dest.length - 1, destination.index),
        },
        [source.droppableId]: {
          ...blockLists[source.droppableId],
          list: blockLists[source.droppableId].list.filter((_, index) => index !== source.index),
        },
      });
    }
  }

  // const deleteBox = (uuid) => {
  //   const newList = {...blockLists};
  //   delete newList[uuid];
  //   setBlockLists(newList);
  // }

  const toggleBoxModal = () => {
    setModalInfo('');
    setModal({
      ...modal,
      box: !modal.box
    });
  }

  const toggleBlockModal = (box, index, confirm) => {
    if(modal.block.show && !confirm && typeof(blockLists[box].list[index].input) === 'undefined') {
      setBlockLists({
        ...blockLists,
        [box]: {
          ...blockLists[box],
          list: blockLists[box].list.filter((_, i) => i !== index)
        }
      });
    }
    setModalInfo('');
    setModal((prevState) => ({
      ...modal,
      block: {
        show: !prevState.block.show,
        box,
        index
      }
    }));
  }

  const addBox = (e) => {
    e.preventDefault();
    if(modalInfo === '') return;
    toggleBoxModal();
    setBlockLists({
      ...blockLists,
      [uuid()]: {
        title: modalInfo,
        list: []
      }
    });
  }

  const editBlock = (e) => {
    e.preventDefault();
    if(modalInfo === '') return;
    const { box, index } = modal.block
    setBlockLists({
      ...blockLists,
      [box]: {
        ...blockLists[box],
        list: blockLists[box].list.map((b, i) => i === index ? { ...b, input: modalInfo, edit: toggleBlockModal } : b)
      }
    });
    toggleBlockModal(box, index, true);
  }

  return (
    <div className={classes.container}>
      {modal.box && (
        <Modal closeModal={toggleBoxModal} title="Adicionar caixa">
          <form onSubmit={addBox}>
            <input type="text" value={modalInfo} onChange={(e) => setModalInfo(e.target.value)} />
            <Button type="submit">Adicionar</Button>
          </form>
        </Modal>
      )}
      {modal.block.show && (
        <Modal closeModal={() => toggleBlockModal(modal.block.box, modal.block.index)} title="Adicionar bloco">
          <form onSubmit={editBlock}>
            <input type="text" value={modalInfo} onChange={(e) => setModalInfo(e.target.value)} />
            <Button type="submit">Adicionar</Button>
          </form>
        </Modal>
      )}
      <DragDropContext onDragEnd={onDragEnd} onBeforeCapture={onBeforeCapture}>
        <div className={classes.boxes} style={{ background: 'transparent', width: '100%' }}>
          <Box id="toolbar" disableDrop>
            <List list={blocksJson.list} toolbar />
          </Box>
        </div>
        <div className={classes.boxes} style={{ minHeight: '50%' }}>
          <div className={classes.buttonBox}>
            <Button onClick={toggleBoxModal} margin="16px 0 0 0">
              <svg style={{ marginRight: 4 }} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 12H19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Adicionar caixa
            </Button>
          </div>
          {Object.keys(blockLists).filter(blockId => blockId !== 'trash').map(blockId => (
            <Box id={blockId} key={blockId} title={blockLists[blockId].title}>
              <List list={blockLists[blockId].list} boxId={blockId} />
            </Box>
          ))}
          <Box id="trash" customClass={!trash ? classes.hidden : null}>
            <div className={[classes.trash, !trash ? classes.hidden : null].join(' ')}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 636.01 848.31" style={{ fill: '#010101', width: 48, height: 48 }} >
                <path d="M240.75,855.89A80,80,0,0,0,321,936.17h380.9a80,80,0,0,0,80.28-80.28V324.24H240.75ZM638.59,422.36h42.82V838.05H638.59Zm-148.07,0h42.81V838.05H490.52Zm-147.19,0h42.82V838.05H343.33Z" transform="translate(-194.36 -87.85)"/>
                <path d="M813.43,181.52H627.89l-10.71-50c-5.35-25.87-27.65-43.71-54.41-43.71H461.08c-25.87,0-48.17,17.84-54.41,43.71l-10.71,50H210.42a16,16,0,0,0-16.06,16v67.8a16,16,0,0,0,16.06,16.05h603.9a16,16,0,0,0,16.06-16.05v-67.8C829.49,188.65,822.35,181.52,813.43,181.52ZM448.59,141.38c.89-6.25,6.25-9.82,12.49-9.82H562.77c6.24,0,11.6,4.46,12.49,9.82l8.92,40.14H439.67Z" transform="translate(-194.36 -87.85)"/>
              </svg>
            </div>
          </Box>
        </div>
      </DragDropContext>
    </div>
  )
}

export default DragArea;
