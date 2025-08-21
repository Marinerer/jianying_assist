import React, { useRef, useState, useEffect } from 'react';
import { HashRouter as Router, Link, NavLink, useHistory } from 'react-router-dom';
import { Navbar, Nav } from 'react-bootstrap';
import UserProfile from './pages/user/UserProfile'; // 引入UserProfile组件
import Routes from './router/index'; // 引入Routes组件
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css'; // Import Bootstrap Icons
import 'react-toastify/dist/ReactToastify.css';
import LocalDataService from './api/LocalDataService';
import './css/index.css'
import { ToastContainer } from 'react-toastify';
import UserInfo from './pages/userInfo/userInfo';
import ApiService from './api/ApiService';
import AIKefu from './components/AIKefu/AIKefu'; // 引入AI客服组件
import MobileNavigation from './components/MobileNavigation'; // 引入移动导航组件

let ipcRenderer;
if (typeof window !== 'undefined' && window.require) {
  ipcRenderer = window.require('electron').ipcRenderer;
}

function App () {
  const userProfileRef = useRef(null);
  const apiService = new ApiService();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    let user_info = LocalDataService.load_user_data();
    if (!user_info) {
      userProfileRef.current.showLoginModal();
    }
    apiService.setUserProfileRef(userProfileRef);

    // 检测是否为移动设备
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const handleNavLinkClick = (e, route) => {
    if (route == '/computing') {
      localStorage.setItem('menuItem', 'MineService');
    }
    let user_info = LocalDataService.load_user_data();
    // 假设 LocalDataService 中有一个方法来检查用户是否已登录
    if (!user_info) {
      e.preventDefault(); // 阻止链接默认行为
      userProfileRef.current.showLoginModal();
      // 如果用户未登录，重定向到登录页面
    }
  };
  const toOfficial = () => {
    ipcRenderer.invoke('open-url', 'https://www.51aigc.cc/#/home');
  }

  return (
    <div className='app'>
      <Router>
        <Navbar expand="lg" className='navigation'>
          <Navbar.Brand as={Link} to="/" style={{ color: 'white', marginLeft: '12px', display: 'flex', alignItems: 'center' }}>
            剪映小助手(免费客户端)
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" className="custom-toggler" />
          <Navbar.Collapse id="basic-navbar-nav" >
            <Nav className="navigation-tab" >
              {/* <NavLink className='tab-info' to='/batchList' onClick={(e) => handleNavLinkClick(e, '/batchList')} activeClassName="active-link" >扣子笔记本</NavLink> */}
              <a className='tab-info' href='#' onClick={toOfficial}>前往官网</a>
              {/* <NavLink className='tab-info' to='/cozeList' onClick={(e) => handleNavLinkClick(e, '/cozeList')} activeClassName="active-link">模板广场</NavLink> */}
              {/* <NavLink className='tab-info' to='/my_wallet' onClick={(e) => handleNavLinkClick(e, '/my_wallet')} activeClassName="active-link" >分销赚钱</NavLink> */}
              {/* <NavLink className='tab-info' to='/templateList' onClick={(e) => handleNavLinkClick(e, '/templateList')} activeClassName="active-link" >模板广场</NavLink> */}
              <NavLink className='tab-info' to='/draftList' onClick={(e) => handleNavLinkClick(e, '/draftList')} activeClassName="active-link" >我的草稿</NavLink>
              <NavLink className='tab-info' to='/userInfo' onClick={(e) => handleNavLinkClick(e, '/userInfo')} activeClassName="active-link" >个人中心</NavLink>
            </Nav>
            <UserProfile ref={userProfileRef} />
          </Navbar.Collapse>
        </Navbar>
        <div className={isMobile ? 'mobile-content' : 'content'}>
          <Routes userProfileRef={userProfileRef} /> {/* 使用Routes组件 */}
        </div>
        <ToastContainer style={{ top: '55px' }} />
        {isMobile && <MobileNavigation userProfileRef={userProfileRef} />}
        <AIKefu /> {/* 添加AI客服组件 */}
      </Router>
    </div>
  );
}

export default App;
