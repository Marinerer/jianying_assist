import React from 'react';
import { NavLink } from 'react-router-dom';
import { House, Grid, BarChart, Person } from 'react-bootstrap-icons';
import LocalDataService from '../../api/LocalDataService';

const MobileNavigation = ({ userProfileRef }) => {
  const handleNavLinkClick = (e, route) => {
    const user_info = LocalDataService.load_user_data();
    if (!user_info) {
      e.preventDefault(); // 阻止链接默认行为
      userProfileRef.current.showLoginModal();
    }
  };

  return (
    <div className="mobile-navigation-tab">
      <NavLink
        exact
        to="/"
        className="mobile-tab-info"
        activeClassName="mobile-active-link"
      >
        <House size={24} />
        <span>首页</span>
      </NavLink>
      {/* <NavLink
        to="/cozeList"
        className="mobile-tab-info"
        activeClassName="mobile-active-link"
        onClick={(e) => handleNavLinkClick(e, '/cozeList')}
      >
        <Grid size={24} />
        <span>模板广场</span>
      </NavLink> */}
      <NavLink
        to="/draftList"
        className="mobile-tab-info"
        activeClassName="mobile-active-link"
        onClick={(e) => handleNavLinkClick(e, '/draftList')}
      >
        <BarChart size={24} />
        <span>我的草稿</span>
      </NavLink>
      <NavLink
        to="/userInfo"
        className="mobile-tab-info"
        activeClassName="mobile-active-link"
        onClick={(e) => handleNavLinkClick(e, '/userInfo')}
      >
        <Person size={24} />
        <span>个人中心</span>
      </NavLink>
    </div>
  );
};

export default MobileNavigation; 