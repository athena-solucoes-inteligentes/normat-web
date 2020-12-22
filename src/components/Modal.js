import React from 'react';

import Backdrop from './Backdrop';

import classes from './Modal.module.css';

const Modal = ({ closeModal, children }) => (
  <>
    <div className={classes.container}>
      {children}
    </div>
    <Backdrop click={closeModal} />
  </>
)

export default Modal;
