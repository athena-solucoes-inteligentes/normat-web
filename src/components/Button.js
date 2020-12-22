import React from 'react';

import classes from './Button.module.css';

const Button = ({ children, onClick, margin }) => {
  return (
    <button
      className={classes.button}
      style={{ margin }}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default Button;
