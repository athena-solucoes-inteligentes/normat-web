import React from 'react';

import DragArea from './components/DragArea';
import Text from './components/Text';

import classes from './App.module.css';

const App = () => {
    return (
      <div className={classes.container}>
        <DragArea />
        <Text />
      </div>
    );
}

export default App;