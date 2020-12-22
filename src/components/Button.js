import React from 'react';

import classes from './Button.module.css';

const Button = ({ children, onClick, margin, type }) => {
  return (
    <button
      className={classes.button}
      style={{ margin }}
      type={type || "button"}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default Button;
