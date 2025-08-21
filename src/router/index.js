import React from 'react';
import { Switch, Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import UserInfo from '../pages/userInfo/userInfo';
import BatchList from '../pages/batch/batchList';
import MyWallet from '../pages/computing/mywallet';
import TemplateList from '../pages/templateList/templateList';
import DraftList from '../pages/batch/draftList';
import cozeList from '../pages/cozeList/cozeList'

const Routes = ({ userProfileRef }) => (
  <Switch>
    <Route exact path="/">
      <BatchList />
    </Route>
    <PrivateRoute path="/batchList" component={BatchList} />
    <PrivateRoute path="/cozeList" component={cozeList} />
    <PrivateRoute path="/my_wallet" component={MyWallet} />
    <PrivateRoute path="/userInfo" component={() => <UserInfo userProfileRef={userProfileRef} />} />
    <PrivateRoute path="/templateList" component={TemplateList} />
    <PrivateRoute path="/draftList" component={DraftList} />
  </Switch>
);

export default Routes;
