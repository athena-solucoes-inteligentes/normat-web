import React, { useCallback, useEffect, useState, useRef } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import 'react-sortable-tree/style.css';
import SortableTree, { getFlatDataFromTree, defaultGetNodeKey, removeNodeAtPath, removeNode } from 'react-sortable-tree';
import { v4 as uuid } from 'uuid'

import Box from './Box';
import Button from './Button';
import List from './List';
import Modal from './Modal';
import api from '../services/api';
import { checkNested } from '../utils'

import blocksJson from '../constants/blocks.json';
import classes from './DragArea.module.css';

const DragArea = () => {
  const [boxList, setBoxList] = useState([]);
  const [blockLists, setBlockLists] = useState({});
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
  const ref = useRef(null);

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  const onBeforeCapture = (before) => {
    const { box, index, show } = modal.block;
    if(show) toggleBlockModal(box, index);
    if(!checkNested(boxList, before.draggableId)) setTrash(true);
  }

  const onDragEnd = (result) => {
    setTrash(false);
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === 'toolbar' && destination.droppableId !== source.droppableId) {
      if(destination.droppableId === 'trash') return;
      const id = `${blocksJson[source.index].name}-${uuid()}`;
      const dest = [
        ...blockLists[destination.droppableId],
        {
          ...blocksJson[source.index],
          id
        }
      ];
      setBlockLists({
        ...blockLists,
        [destination.droppableId]: reorder(dest, dest.length - 1, destination.index)
      });
      if(blocksJson[source.index].editable && destination.droppableId !== 'trash')
        toggleBlockModal(destination.droppableId, destination.index);
    } else if (source.droppableId !== 'toolbar' && destination.droppableId === source.droppableId) {
      if(source.index === destination.index) return;
      setBlockLists({
        ...blockLists,
        [destination.droppableId]: reorder(blockLists[destination.droppableId], source.index, destination.index)
      });
    } else if (source.droppableId !== 'toolbar' && destination.droppableId !== source.droppableId) {
      if(destination.droppableId === 'trash')
        return setBlockLists({
          ...blockLists,
          [source.droppableId]: blockLists[source.droppableId].filter((_, index) => index !== source.index)
        });
      const dest = [
        ...blockLists[destination.droppableId],
        blockLists[source.droppableId][source.index]
      ];
      setBlockLists({
        ...blockLists,
        [destination.droppableId]: reorder(dest, dest.length - 1, destination.index),
        [source.droppableId]: blockLists[source.droppableId].filter((_, index) => index !== source.index)
      });
    }
  }

  const toggleBoxModal = useCallback(() => {
    setModalInfo('');
    setModal({
      ...modal,
      box: !modal.box
    });
  }, [modal])

  const toggleBlockModal = useCallback((box, index, confirm) => {
    if(modal.block.show && !confirm && !checkNested(blockLists, box, index, 'input')) {
      setBlockLists({
        ...blockLists,
        [box]: blockLists[box].filter((_, i) => i !== index)
      });
    }
    setModalInfo('');
    setModal(prevState => ({
      ...modal,
      block: {
        show: !prevState.block.show,
        box,
        index
      }
    }));
  }, [modal, blockLists])

  const pasteBlocks = useCallback(async (boxId) => {
    navigator.clipboard.readText()
      .then(text => {
        setBlockLists(blocks => {
          try {
            const clipboard = JSON.parse(text);
            const list = [...blocks[boxId]];
            clipboard.list.forEach((c) => {
              const block = blocksJson.filter(b => b.name === c.name);
              if(!block.length) return;
              list.push({
                id: `${c.name}-${uuid()}`,
                name: c.name,
                input: block[0].editable ? c.input : undefined,
                edit: block[0].editable ? toggleBlockModal : undefined,
                ...block[0],
              });
            });
            return {
            ...blocks,
            [boxId]: list,
            }
          } catch(e) {
            console.log(e);
            alert('Erro ao copiar bloco(s)!');
            return blocks;
          }
        });
      });
  }, [toggleBlockModal])

  const deleteBlock = (boxId, index) => {
    setBlockLists((blocks) => ({
      ...blocks,
      [boxId]: blocks[boxId].filter((_, i) => i !== index),
    }));
  }

  const deleteBox = (boxId) => {
    setBoxList((boxes) => {
      const node = getFlatDataFromTree({
        treeData: boxes,
        getNodeKey: defaultGetNodeKey,
        ignoreCollapsed: false
      }).find((n) => n.node.id === boxId);
      setBlockLists((blocks) => {
        delete blocks[boxId];
        return blocks;
      });
      return removeNodeAtPath({
        treeData: boxes,
        getNodeKey: defaultGetNodeKey,
        path: node.path,
        ignoreCollapsed: false
      });
    });
  }

  const clearBox = (boxId) => {
    setBlockLists((blocks) => ({
      ...blocks,
      [boxId]: [],
    }));
  }

  const addBox = useCallback((e) => {
    e.preventDefault();
    if(modalInfo === '') return;
    toggleBoxModal();
    const id = uuid();
    setBlockLists({
      ...blockLists,
      [id]: [],
    });
    setBoxList([
      ...boxList,
      {
        id,
        name: modalInfo,
        list: blockLists[id],
        title: modalInfo
      }
    ]);
  }, [boxList, blockLists, modalInfo, toggleBoxModal])

  const updateChildrenOnList = (box) => {
    return {
      ...box,
      list: blockLists[box.id],
      children: box.children ? box.children.map(children => updateChildrenOnList(children)) : undefined,
    }
  }

  useEffect(() => {
    setBoxList(b => b.map(box => updateChildrenOnList(box)));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockLists]);

  const editBlock = (e) => {
    e.preventDefault();
    if(modalInfo === '') return;
    const { box, index } = modal.block
    setBlockLists({
      ...blockLists,
      [box]: blockLists[box].map((b, i) => i === index ? { ...b, input: modalInfo, edit: toggleBlockModal } : b)
    });
    toggleBlockModal(box, index, true);
  }

  const processBoxes = () => {
    const token = localStorage.getItem('token');
    if(!token) return;
    console.log(boxList);
    api.post('/', {
      boxes: boxList
    }, {
      params: {
        token
      }
    })
      .then(res => console.log(res.data))
      .catch(err => console.log(err));
  }

  return (
    <div className={classes.container}>
      {modal.box && (
        <Modal closeModal={toggleBoxModal} title="Adicionar caixa">
          <form onSubmit={addBox}>
            <input type="text" placeholder="Nome da caixa" value={modalInfo} onChange={(e) => setModalInfo(e.target.value)} />
            <Button type="submit">Adicionar</Button>
          </form>
        </Modal>
      )}
      {modal.block.show && (
        <Modal closeModal={() => toggleBlockModal(modal.block.box, modal.block.index)} title="Adicionar bloco">
          <form onSubmit={editBlock}>
            <input type="text" placeholder="Argumento do bloco" value={modalInfo} onChange={(e) => setModalInfo(e.target.value)} />
            <Button type="submit">Adicionar</Button>
          </form>
        </Modal>
      )}
      <DragDropContext onDragEnd={onDragEnd} onBeforeCapture={onBeforeCapture}>
        <div className={classes.boxes} style={{ background: 'transparent', width: '100%' }}>
          <Box id="toolbar">
            <List list={blocksJson} toolbar />
          </Box>
        </div>
        <div className={classes.boxes} style={{ minHeight: '85%' }}>
          <div className={classes.buttonBox}>
            <Button onClick={toggleBoxModal} margin="16px 0 0 0">
              <svg style={{ marginRight: 4 }} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 12H19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Adicionar caixa
            </Button>
          </div>
          <div className={classes.treeContainer}>
            <SortableTree
              dndType="BOX"
              treeData={boxList}
              onChange={setBoxList}
              rowHeight={140}
              nodeContentRenderer={(props) => (
                  <Box
                    title={props.node.title}
                    pasteBlocks={pasteBlocks}
                    deleteBox={deleteBox}
                    clearBox={clearBox}
                    deleteBlock={deleteBlock}
                    list={props.node.list}
                    id={props.node.id}
                    {...props}
                  >
                    <List list={props.node.list} boxId={props.node.id} deleteBlock={deleteBlock}/>
                  </Box>
                )}
            />
          </div>
          <Box id="trash" customClass={!trash ? classes.hidden : null}>
            <div className={[classes.trash, !trash ? classes.hidden : null].join(' ')}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 636.01 848.31" style={{ fill: '#010101', width: 48, height: 48 }} >
                <path d="M240.75,855.89A80,80,0,0,0,321,936.17h380.9a80,80,0,0,0,80.28-80.28V324.24H240.75ZM638.59,422.36h42.82V838.05H638.59Zm-148.07,0h42.81V838.05H490.52Zm-147.19,0h42.82V838.05H343.33Z" transform="translate(-194.36 -87.85)"/>
                <path d="M813.43,181.52H627.89l-10.71-50c-5.35-25.87-27.65-43.71-54.41-43.71H461.08c-25.87,0-48.17,17.84-54.41,43.71l-10.71,50H210.42a16,16,0,0,0-16.06,16v67.8a16,16,0,0,0,16.06,16.05h603.9a16,16,0,0,0,16.06-16.05v-67.8C829.49,188.65,822.35,181.52,813.43,181.52ZM448.59,141.38c.89-6.25,6.25-9.82,12.49-9.82H562.77c6.24,0,11.6,4.46,12.49,9.82l8.92,40.14H439.67Z" transform="translate(-194.36 -87.85)"/>
              </svg>
            </div>
          </Box>
        </div>
        <Button onClick={processBoxes}>Processar</Button>
        <a ref={ref} href="/" target="_blank" style={{ display: 'none' }}>Download</a>
      </DragDropContext>
    </div>
  )
}

export default DragArea;
