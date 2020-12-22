import React from 'react';

import classes from './Backdrop.module.css';

const Backdrop = ({ click }) => <div onClick={click} className={classes.container}/>

export default Backdrop;
