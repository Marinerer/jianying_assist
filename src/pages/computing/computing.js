import React, { useState, useEffect,useRef } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import { House, Display, HddStack,CurrencyExchange,Database } from 'react-bootstrap-icons';
import { useSwipeable } from 'react-swipeable';
import MineService from './MineService';
import Market from './Market';
import MineMachine from './MineMachine';
import Recharge from './recharge';
import RechargeDetails from './rechargeDetails';

import './computing.css';
function Computing () {
  const [showSidebar, setShowSidebar] = useState(window.innerWidth > 768);
  const [selectedMenuItem, setSelectedMenuItem] = useState('MineService');
  const modalRef = React.useRef(0);
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      console.log('向左滑');
      setShowSidebar(false)
    },

    onSwipedRight: () => {
      console.log('向右滑');
      setShowSidebar(true)
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  useEffect(() => {
    setSelectedMenuItem(localStorage.getItem('menuItem')||'MineService') 
    return () => {
    };
  }, []);

  const toSetSelectedMenuItem = async (item) => {
    localStorage.setItem('menuItem', item);
    setSelectedMenuItem(item)
  }
  const toMarket = (MenuItem,index)=>{
    toSetSelectedMenuItem(MenuItem)
    localStorage.setItem('menuItem', MenuItem);
    modalRef.current = index
  }
  const toMineMachine = (MenuItem)=>{
    toSetSelectedMenuItem(MenuItem)
    localStorage.setItem('menuItem', MenuItem);
  }

  return (
    <div className='computing'>
      <div className='mine-content'>
        <div id="sidebar-wrapper" className={`mine-table ${showSidebar ? '' : 'hide-sidebar'}`} {...swipeHandlers}>
          <div className="bg-dark mine-table-left" >
            <ul className="nav nav-pills flex-column mb-auto ">
              <Nav.Item>
                <Nav.Link className='text-white ' active={selectedMenuItem === 'MineService'} onClick={() => toSetSelectedMenuItem('MineService')}>
                  <House style={{ transform: 'translateY(-2px)' }} size={18} className='me-2' />
                  我的服务
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link className='text-white ' active={selectedMenuItem === 'Market'} onClick={() => toSetSelectedMenuItem('Market')}>
                  <HddStack style={{ transform: 'translateY(-2px)' }} size={18} className='me-2' />
                  算力市场
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link className='text-white ' active={selectedMenuItem === 'MineMachine'} onClick={() => toSetSelectedMenuItem('MineMachine')}>
                  <Display style={{ transform: 'translateY(-2px)' }} size={18} className='me-2' />
                  我的机器
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link className='text-white ' active={selectedMenuItem === 'Recharge'} onClick={() => toSetSelectedMenuItem('Recharge')}>
                  <CurrencyExchange style={{ transform: 'translateY(-2px)' }} size={18} className='me-2' />
                  充值金额
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link className='text-white ' active={selectedMenuItem === 'RechargeDetails'} onClick={() => toSetSelectedMenuItem('RechargeDetails')}>
                  <Database style={{ transform: 'translateY(-2px)' }} size={18} className='me-2' />
                  消费明细
                </Nav.Link>
              </Nav.Item>
            </ul>
            <hr />
          </div>
        </div>
        < div className="mine-content-right" >
          {(localStorage.getItem('menuItem') === 'MineService'||!localStorage.getItem('menuItem')) && <MineService  updateMenu={toSetSelectedMenuItem} toMarket={toMarket}  />}
          {localStorage.getItem('menuItem') === 'Market' && <Market dockerIndex={modalRef.current} updateMenu={toMineMachine} />}
          {localStorage.getItem('menuItem') === 'MineMachine' && <MineMachine />}
          {localStorage.getItem('menuItem') === 'Recharge' && <Recharge />}
          {localStorage.getItem('menuItem') === 'RechargeDetails' && <RechargeDetails />}
        </div>
      </div>
    </div>
  );
}

export default Computing;
