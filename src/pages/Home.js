import React from 'react';

import DragArea from '../components/DragArea';
import Text from '../components/Text';

import classes from './Home.module.css';

const Home = () => (
  <div className={classes.container}>
    <DragArea />
    <Text />
  </div>
);

export default Home;
