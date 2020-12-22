import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import Home from './pages/Home';
import Upload from './pages/Upload';

const Routes = () => (
  <BrowserRouter>
    <Switch>
      <Route path="/upload" component={Upload} />
      <Route component={Home} />
    </Switch>
  </BrowserRouter>
);

export default Routes;
