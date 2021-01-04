import React from 'react';

import Backdrop from './Backdrop';

import classes from './Modal.module.css';

const Modal = ({ closeModal, title, children }) => (
  <>
    <div className={classes.container}>
      <header>{title}</header>
      {children}
    </div>
    <Backdrop click={closeModal} />
  </>
);

export default Modal;
