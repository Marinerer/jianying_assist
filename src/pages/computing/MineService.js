import React, { useEffect, useState, forwardRef } from 'react';
import { Button } from 'react-bootstrap';
import './computing.css'
import ApiService from '../../api/ApiService';
import LocalDataService from '../../api/LocalDataService';
import { ExclamationCircle } from 'react-bootstrap-icons';
import MirrorMarket from '../../components/MirrorMarket/index'

const MineService = forwardRef(({ updateMenu, toMarket }, ref) => {
  const api = new ApiService();
  let user = LocalDataService.load_user_data();
  const [totalMoney, setTotalMoney] = useState(0);

  useEffect(() => {
    get_user_money()

  }, []);

  const get_user_money = async () => {
    let res = await api.get_user_money(user.token);
    if (res) {
      setTotalMoney(res.total_money)
    }
  }
  return (
    <div className='MineService'>
      <div className='MineService-tab'>

        <div className='MineService-top'>
          <div className='MineService-title'>我的服务</div>
          <div className='MineService-content'>

            <div className='MineService-machine'>
              <div className='machine-tips'>运行中</div>
              <div className='machine-num'>0</div>
            </div>

          </div>
        </div>
        <div className='MineService-balance'>
          <div className='MineService-title'>费用信息</div>
          <div className='balance-content'>

            <div className='balance-left'>
              <div className='balance-tips'>我的余额</div>
              <div className='balance-num'>￥ <span>{totalMoney / 100}</span> </div>
            </div>
            <div className='balance-right'>
              <Button className='btn-sm to-rech' onClick={() => updateMenu('Recharge')}>去充值</Button>
            </div>
          </div>
          <div className='balance-buttom'>
            <div className='balance-buttom-left' onClick={() => updateMenu('RechargeDetails')}>
              {'消费明细>'}
            </div>
            {/* <div className='balance-buttom-right'>

            </div> */}
          </div>
        </div>
      </div>
      <div className='tips'><ExclamationCircle style={{ transform: 'translateY(-2px)', color: '#f0830c' }} size={18} className='me-2' />  请勿生成违禁图片，否则法律后果自负，一经发现立即封号！</div>
      <div className='image-title'>镜像市场</div>
      <MirrorMarket updateMenu={toMarket}></MirrorMarket>
    </div>
  );
})

export default MineService;
