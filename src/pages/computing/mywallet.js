import React, { useEffect, useState, useRef } from 'react';
import { } from 'react-router-dom';
import { Button, Modal } from 'react-bootstrap';
import ApiService from '../../api/ApiService';
import LocalDataService from '../../api/LocalDataService';
import { toast } from 'react-toastify';
import Recharge from './recharge';
import RechargeDetails from './rechargeDetails';
import RechargeDetailsWallet from './rechargeDetailsWallet';
import './mywallet.css'


function MyWallet () {
  let ipcRenderer;
  if (typeof window !== 'undefined' && window.require) {
    ipcRenderer = window.require('electron').ipcRenderer;
  }
  const api = new ApiService();
  let user = LocalDataService.load_user_data();
  const [user_info, setUser_info] = useState({});
  const [totalMoney, setTotalMoney] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    load_user_info()
    get_user_money()

  }, [])

  const get_user_money = async () => {
    let res = await api.get_user_money(user.token);
    if (res) {
      setTotalMoney(res.total_money)
    }
  }

  const load_user_info = async () => {
    let api = new ApiService();
    let user = LocalDataService.load_user_data();
    let res = await api.get_user_info(user.token);
    console.log(res, 'res');
    if (res) {
      setUser_info(res)
    }
  }
  const updateMenu = () => {
    toast.error('请前往官方文档联系管理员打款...')
  }

  // 添加复制推广链接的方法
  const copyPromotionLink = () => {
    const promotionLink = `https://ts.fyshark.com/#/login?user_id=${user_info.id}`;
    navigator.clipboard.writeText(promotionLink)
      .then(() => {
        toast.success('推广链接已复制');
      })
      .catch(err => {
        toast.error('复制失败，请重试');
      });
  }

  const toOfficial = () => {
    ipcRenderer.invoke('open-url', 'https://krxc4izye0.feishu.cn/wiki/VyInwFOtEirxL9kwd6Hcko6VnIh?from=from_copylink');
  }

  return (
    <div className='wallet-content'>
      <div className='wallet-left'>
        <div className='user-info-left'>

          <div className='user-card container '>
            <div className='user-info-content'>
              <div className='user-card-number'>
                <div className='number-circle'>{user_info && user_info.name && user_info.name.charAt(0)}</div>
              </div>
              <div >
                <div className=' row'>
                  <div className=' user-detail-title'>ID：{user_info.id}</div>
                </div>
                <div className=' row'>
                  <div className='user-detail-title'>手机号：{user_info.phone}</div>
                </div>
                <div className=' row'>
                  <div className='user-detail-title'>分成比例：<text style={{ color: 'rgb(255 68 68)', fontSize: '20px' }}>{user_info.commission_rate}%</text></div>
                </div>
              </div>
            </div>


          </div>
          <div className='money-info'>
            <div className='money-info-title'>{`可提取金额(元)：`}<text style={{ color: 'rgb(255 68 68)', fontSize: '20px' }}>{totalMoney / 100}</text>  </div>
            <div className='money-info-button' onClick={() => updateMenu()}> 去提现</div>
          </div>
          <div className='money-info-content'>
            <div className='money-info-content-item'>
              <div className='money-info-content-item-title'>{`累计用户数(人)`}</div>
              <div className='money-info-content-item-value'><text style={{ color: 'rgb(255 68 68)', fontSize: '20px' }}>{totalCount}</text></div>
            </div>
          </div>
          <div className='tuiguang'>
            <div className='tuiguang-title'>您的专属推广链接</div>
            <div className='tuiguang-url'>{`https://ts.fyshark.com/#/login?user_id=${user_info.id}`}</div>
            <div className='tuiguang-button'>
              <div className='tuiguang-left-button' onClick={copyPromotionLink}>复制去推广</div>
              <div className='tuiguang-right-button' onClick={toOfficial}>赚钱攻略</div>
            </div>
          </div>
        </div>

        <div className='user-info-right'>
          <div className='user-info-right-title'>{`下级用户表`}</div>
          <RechargeDetailsWallet setTotalCount={setTotalCount}></RechargeDetailsWallet>
         
        </div>
      </div>

      <div className='wallet-right'>
        <div className='user-info-right-title'>{`用户消费记录表`}</div>
        <RechargeDetails></RechargeDetails>
      </div>

    </div>
  );
}

export default MyWallet;
