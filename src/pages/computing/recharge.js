import React, { useEffect, useState, useRef } from 'react';
import { } from 'react-router-dom';
import { Button, Modal } from 'react-bootstrap';
import ApiService from '../../api/ApiService';
import LocalDataService from '../../api/LocalDataService';
import { toast } from 'react-toastify';
import './computing.css'
function Recharge () {
  const api = new ApiService();
  let user = LocalDataService.load_user_data();
  const [totalMoney, setTotalMoney] = useState(0);
  const [moneyIndex, setMoneyIndex] = useState(0);
  const [playTypeIndex, setPlayTypeIndex] = useState(0);
  const [shopList, setShopList] = useState([]);
  const timerId = useRef(null);
  const clearTimerId = useRef(null);
  const [qrcode, setQrcode] = useState('');
  const [show, setShow] = useState(false);
  const [payTitle, setPayTitle] = useState('微信支付');
  const [redemptionCode, setRedemptionCode] = useState('');


  useEffect(() => {
    get_pay_info_list()
    get_user_money()
    return () => {
      if (timerId.current) {
        clearInterval(timerId.current);
      }
      if (clearTimerId.current) {
        clearTimeout(clearTimerId.current);
      }
    };
  }, []);

  const get_pay_info_list = async () => {
    let api = new ApiService();
    let user = LocalDataService.load_user_data();
    let res = await api.get_pay_info_list(user.token, 5);
    setShopList(res)
  }

  const get_user_money = async () => {
    let res = await api.get_user_money(user.token);
    if (res) {
      setTotalMoney(res.total_money)
    }
  }


  const creatPayInfo = async () => {
    let api = new ApiService();
    let user = LocalDataService.load_user_data();

    if (playTypeIndex == 0) {
      let res = await api.create_wx_order_info(user.token, shopList[moneyIndex].id);
      setQrcode(`data:image/png;base64,${res.img_b64}`)
      setPayTitle('微信支付')
      timerId.current = setInterval(() => {
        get_order_info(res.order_info.out_trade_no);
      }, 1000);
      clearTimerId.current = setTimeout(() => {
        clearInterval(timerId.current);
      }, 5 * 60 * 1000);  // 5 minutes
    } else if (playTypeIndex == 1) {
      let res = await api.create_alipay_order_info(user.token, shopList[moneyIndex].id);
      setQrcode(`data:image/png;base64,${res.img_b64}`)
      setPayTitle('支付宝支付')
      timerId.current = setInterval(() => {
        get_order_info(res.order_info.out_trade_no);
      }, 1000);
      clearTimerId.current = setTimeout(() => {
        clearInterval(timerId.current);
      }, 5 * 60 * 1000);  // 5 minutes
    }
    setShow(true)


  };

  const get_order_info = async (out_trade_no) => {
    console.log(out_trade_no, 'out_trade_no');
    let api = new ApiService();
    let user = LocalDataService.load_user_data();
    let res = await api.get_order_info(user.token, out_trade_no);
    if (!res) {
      setShow(false);
      toast.error('支付失败，请重新支付')
      clearInterval(timerId.current);
      return
    }
    if (res.status == 2) {
      setShow(false);
      toast('支付成功')
      clearInterval(timerId.current);
      get_user_money()
    }

  }
  const handleClose = () => {

    setShow(false);
    clearInterval(timerId.current);
  }

  const handleInputChange = event => {
    setRedemptionCode(event.target.value);
  };

  const handleSubmit = async event => {
    event.preventDefault();
    let api = new ApiService();
    let user = LocalDataService.load_user_data();
    let res = await api.consume_activation_code(user.token, redemptionCode);
    if (res.code == 200) {
      get_user_money()
      setRedemptionCode('');
    }
    console.log(res, 'res');
    // 处理确认提交代码在这里, 比如：console.log(redemptionCode);
  };

  return (
    <div className='recharge'>
      <div className='recharge-content'>
        {/* <img className='Market-img' src='https://s.coze.cn/t/ChFVISWzUR6qYJUU/' /> */}
        <div className='Market-top-info'>
          <div className='Market-title'>普通月卡 VIP</div>
          <div className='Market-tab'>￥48/月</div>
          <div className='Market-button'>立即购买</div>
        </div>
      </div>
      <div className='recharge-content'>
        <div className='Market-top-info'>
          <div className='Market-title'>优惠年卡 SVIP</div>
          <div className='Market-tab'>￥199/年</div>
          <div className='Market-button'>立即购买</div>
        </div>
      </div>
      <div className='recharge-content'>
        <div className='Market-top-info'>
          <div className='Market-title'>至尊永久卡</div>
          <div className='Market-tab'>￥499/永久</div>
          <div className='Market-button'>立即购买</div>
        </div>
      </div>
      {/* <div className='recharge-content'>
        <div className='Market-top-info'>
          <div className='Market-title'>账户余额：</div>
          <div className='recharge-num'>
            ￥{totalMoney / 100}
          </div>
        </div>
       
        <div className='Market-top-info'>
          <div className='Market-title'>充值金额：</div>
          <div className='Market-tab'>
            {
              shopList.map((item, index) => (
                <div className={`Market-tab-info ${index == moneyIndex ? 'Market-tab-info-active' : ''}`} key={index} onClick={() => setMoneyIndex(index)}>
                  ￥{item.money / 100}
                </div>
              ))
            }
          </div>
        </div>
        <div className='Market-top-info'>
          <div className='Market-title'>支付方式:</div>
          <div className='play-type-content'>
            <div className='play-type-info'
              style={playTypeIndex == 0 ? { border: '1px solid #10ec25' } : {}}
              onClick={() => setPlayTypeIndex(0)}
            >
              <img src='https://video-img.fyshark.com/1702283061156weixin.png' />
              微信支付
            </div>
            <div className='play-type-info'
              style={playTypeIndex == 1 ? { border: '1px solid #10ec25' } : {}}
              onClick={() => setPlayTypeIndex(1)}
            >
              <img src='https://video-img.fyshark.com/1702284888116zhifubao.png' />
              支付宝支付
            </div>
          </div>
        </div>
        <div className='Market-top-info'>
          <div className='Market-title'></div>
          <div className='play-type-content'>
            <Button className='Market-button' onClick={(e) => creatPayInfo()}>充值</Button>
          </div>
        </div>

      </div> */}
      <Modal show={show} centered>
        <Modal.Header >
          <Modal.Title>{payTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <img src={qrcode} style={{ width: '200px', height: '200px' }} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            取消
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Recharge;
