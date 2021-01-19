import React, { useCallback, useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { v4 as uuid } from 'uuid'

import Box from './Box';
import Button from './Button';
import List from './List';
import Modal from './Modal';

import blocksJson from '../constants/blocks.json';
import classes from './DragArea.module.css';

const DragArea = () => {
  const [boxList, setBoxList] = useState({});
  const [organizedBoxList, setOrganizedBoxList] = useState({});
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

  const putKeyAfter = (object, key1, key2) => {
    const res = {};
    let prev = undefined;
    for(let i of Object.keys(object)) {
      if(key2 === prev) res[key1] = object[key1];
      if(i !== key1) res[i] = object[i];
      prev = i;
    }
    if(key2 === prev) res[key1] = object[key1];
    return res;
  }

  const organizeBoxes = useCallback(() => {
    const output = {};
    Object.keys(boxList).forEach(boxKey => {
      let temp = output;
      if(Array.isArray(boxList[boxKey].parent)) {
        boxList[boxKey].parent.forEach((p, i) => {
          if(i === 0) {
            temp[p] = temp[p] || {};
            temp = temp[p];
          } else {
            temp.children = temp.children || {};
            temp.children[p] = temp.children[p] || {};
            temp = temp.children[p];
          }
        });
        temp.children = {...temp.children, [boxKey]: {...boxList[boxKey]}};
      } else {
        temp[boxKey] = {...temp[boxKey], ...boxList[boxKey]};
        temp = temp[boxKey];
      }
    });
    setOrganizedBoxList(output)
  }, [boxList]);

  const getOrganizedBox = useCallback(boxKey => {
    let parent = organizedBoxList;
    if(Array.isArray(boxList[boxKey].parent))
      boxList[boxKey].parent.forEach(parentKey => {
        if(typeof(parent[parentKey]) === 'undefined') return;
        parent = parent[parentKey];
      });
    return {...parent[boxKey]};
  }, [boxList, organizedBoxList]);

  const propagateParent = (list, parent, children) => {
    if(!children) return;
    Object.keys(children).forEach(childKey => {
      list[childKey].parent = [...list[parent].parent, parent];
      propagateParent(list, childKey, children[childKey].children);
    });
  }

  const propagateReorder = (output, box, boxKey) => {
    if(typeof(box.children) === 'undefined') return;
    let previousKey = boxKey;
    Object.keys(box.children).forEach(child => {
      output.list = putKeyAfter(output.list, child, previousKey);
      previousKey = child;
      propagateReorder(output, box.children[child], child);
    });
  }

  useEffect(() => organizeBoxes(), [organizeBoxes]);
  useEffect(() => {
    console.log('organized', organizedBoxList);
    console.log('boxList', boxList);
    console.log('organized keys', Object.keys(organizedBoxList).map(e => `${e} - ${organizedBoxList[e].title}`));
    console.log('boxList keys', Object.keys(boxList).map(e => `${e} - ${boxList[e].title}`));
  }, [organizedBoxList, boxList]);

  const onBeforeCapture = (before) => {
    const { box, index, show } = modal.block;
    if(show) toggleBlockModal(box, index);
    if(typeof(boxList[before.draggableId]) === 'undefined') setTrash(true);
  }
  const onDragEnd = (result) => {
    setTrash(false);
    const { source, destination, combine, type } = result;
    console.log('result', result);
    if (!destination && !combine) return;
    switch(type) {
      case 'BOX':
        if(!destination && combine) {
          const boxKey = Object.keys(organizedBoxList)[source.index];
          const newParentBoxKey = combine.draggableId;
          let output = {...boxList};
          const box = getOrganizedBox(boxKey);
          output[boxKey] = {
            ...output[boxKey],
              parent: Array.isArray(output[newParentBoxKey].parent)
                ? [...output[newParentBoxKey].parent, newParentBoxKey]
                : [newParentBoxKey],
          };
          propagateParent(output, boxKey, box.children);
          return setBoxList(output);
        }
        if(source.droppableId === destination.droppableId) {
          if(source.index === destination.index) return;
          if(source.droppableId === 'BOXES') {
            const organizedBoxListKeys = Object.keys(organizedBoxList);
            const sourceKey = organizedBoxListKeys[source.index];
            const destKey = organizedBoxListKeys[source.index < destination.index ? destination.index : destination.index - 1];
            let newBoxList = { list: putKeyAfter(boxList, sourceKey, destKey) };
            propagateReorder(newBoxList, organizedBoxList[sourceKey], sourceKey);
            setBoxList(newBoxList.list);
          } else {

          }
        } else {
          if(source.droppableId === 'BOXES') {
            const boxKey = Object.keys(boxList)[source.index];
            const newParentBoxKey = destination.droppableId.split(';')[0];
            setBoxList({
              ...boxList,
              [boxKey]: {
                ...boxList[boxKey],
                parent: Array.isArray(boxList[boxKey].parent) ? [...boxList[boxKey].parent, newParentBoxKey] : [newParentBoxKey]
              }
            });
          }
        }

      break;

      case 'BLOCK':
        if (source.droppableId === 'toolbar' && destination.droppableId !== source.droppableId) {
          if(destination.droppableId === 'trash') return;
          const id = `${blocksJson[source.index].name}-${uuid()}`;
          const dest = [
            ...boxList[destination.droppableId].list,
            {
              ...blocksJson[source.index],
              id
            }
          ];
          setBoxList({
            ...boxList,
            [destination.droppableId]: {
              ...boxList[destination.droppableId],
              list: reorder(dest, dest.length - 1, destination.index)
            },
          });
          if(blocksJson[source.index].editable && destination.droppableId !== 'trash')
            toggleBlockModal(destination.droppableId, destination.index);
        } else if (source.droppableId !== 'toolbar' && destination.droppableId === source.droppableId) {
          if(source.index === destination.index) return;
          setBoxList({
            ...boxList,
            [destination.droppableId]: {
              ...boxList[destination.droppableId],
              list: reorder(boxList[destination.droppableId].list, source.index, destination.index),
            },
          });
        } else if (source.droppableId !== 'toolbar' && destination.droppableId !== 'toolbar' && destination.droppableId !== source.droppableId) {
          if(destination.droppableId === 'trash')
            return setBoxList({
              ...boxList,
              [source.droppableId]: {
                ...boxList[source.droppableId],
                list: boxList[source.droppableId].list.filter((_, index) => index !== source.index),
              },
            });
          const dest = [
            ...boxList[destination.droppableId].list,
            boxList[source.droppableId].list[source.index],
          ];
          setBoxList({
            ...boxList,
            [destination.droppableId]: {
              ...boxList[destination.droppableId],
              list: reorder(dest, dest.length - 1, destination.index),
            },
            [source.droppableId]: {
              ...boxList[source.droppableId],
              list: boxList[source.droppableId].list.filter((_, index) => index !== source.index),
            },
          });
        }
      break;

      default:
      break;
    }
  }

  const toggleBoxModal = () => {
    setModalInfo('');
    setModal({
      ...modal,
      box: !modal.box
    });
  }

  const toggleBlockModal = (box, index, confirm) => {
    if(modal.block.show && !confirm && typeof(boxList[box].list[index].input) === 'undefined') {
      setBoxList({
        ...boxList,
        [box]: {
          ...boxList[box],
          list: boxList[box].list.filter((_, i) => i !== index)
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

  const pasteBlocks = async (boxId) => {
    try {
      const clipboard = JSON.parse(await navigator.clipboard.readText());
      const list = [...boxList[boxId].list];
      clipboard.blocks.forEach((c) => {
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
    setBoxList({
      ...boxList,
      [boxId]: {
        ...boxList[boxId],
        list,
      },
    })
    } catch(e) {
      console.log(e);
      alert('Erro ao copiar bloco(s)!');
    }
  }

  const deleteBlock = (boxId, index) => {
    setBoxList({
      ...boxList,
      [boxId]: {
        ...boxList[boxId],
        list: boxList[boxId].list.filter((_, i) => i !== index)
      }
    })
  }

  const deleteBox = (boxId) => {
    const list = {...boxList};
    delete list[boxId];
    setBoxList(list);
  }

  const clearBox = (boxId) => {
    setBoxList({
      ...boxList,
      [boxId]: {
        ...boxList[boxId],
        list: []
      }
    });
  }

  const addBox = (e) => {
    e.preventDefault();
    if(modalInfo === '') return;
    toggleBoxModal();
    setBoxList({
      ...boxList,
      [uuid()]: {
        title: modalInfo,
        list: [],
      }
    });
  }

  const editBlock = (e) => {
    e.preventDefault();
    if(modalInfo === '') return;
    const { box, index } = modal.block
    setBoxList({
      ...boxList,
      [box]: {
        ...boxList[box],
        list: boxList[box].list.map((b, i) => i === index ? { ...b, input: modalInfo, edit: toggleBlockModal } : b)
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
          <Droppable droppableId="BOXES" direction="vertical" type="BOX" isCombineEnabled>
            {(provided, snapshot) => (
              <div style={{ width: '100%' }}>
                  <div ref={provided.innerRef}>
                    {Object.keys(organizedBoxList).map((boxId, i) => (
                      <Draggable draggableId={boxId} index={i} key={boxId}>
                        {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                            >
                              <Box
                                id={boxId}
                                key={boxId}
                                title={boxList[boxId].title}
                                boxList={organizedBoxList[boxId].children || {}}
                                pasteBlocks={pasteBlocks}
                                deleteBox={deleteBox}
                                clearBox={clearBox}
                                list={boxList[boxId].list}
                                dragHandleProps={provided.dragHandleProps}
                                deleteBlock={deleteBlock}
                              >
                                <List list={boxList[boxId].list} boxId={boxId} deleteBlock={deleteBlock} />
                              </Box>
                            </div>
                          )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
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
