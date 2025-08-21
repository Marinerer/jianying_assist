import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import LocalDataService from '../api/LocalDataService';

// 路由拦截（防止没登录直接跳转针对页）
function isLoggedIn () {
  let user_info = LocalDataService.load_user_data()
  
  if (!user_info) {
    console.log('没登录');
    return false
  }
  console.log('已登录');
  return true
}

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      isLoggedIn() ? (
        <Component {...props} />
      ) : (
        <Redirect to="/" />
      )
    }
  />
);

export default PrivateRoute;
