import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import ApiService from '../../api/ApiService';
import LocalDataService from '../../api/LocalDataService';
import { toast } from 'react-toastify';
import './index.css'; // 自定义样式

const VipBox = forwardRef(({ updateMenu }, ref) => {
  const [isVisible, setIsVisible] = useState(false); // 控制弹窗显示
  const [shopList, setShopList] = useState([]);
  const [shopListIndex, setShopListIndex] = useState(0);
  const [qrcode, setQrcode] = useState('');
  const [payTitle, setPayTitle] = useState('微信支付');
  const [playTypeIndex, setPlayTypeIndex] = useState(0);
  const timerId = useRef(null);
  const clearTimerId = useRef(null);


  useEffect(() => {
    get_pay_info_list()
    return () => {
      // 清除定时器
      if (timerId.current) {
        clearInterval(timerId.current);
      }
      if (clearTimerId.current) {
        clearTimeout(clearTimerId.current);
      }
    };
  }, []);

  useEffect(() => {
    if (shopList.length > 0) {
      console.log('付钱定时器');
      
      creatPayInfo(shopList[shopListIndex].id);
    }
  }, [playTypeIndex, shopListIndex, isVisible]);

  const get_pay_info_list = async () => {
    let api = new ApiService();
    let user = LocalDataService.load_user_data();
    let res = await api.get_pay_info_list(user.token, 0);
    setShopList(res)
    if (res.length > 0) {
      creatPayInfo(res[shopListIndex].id);
    }
  }

  const creatPayInfo = async (id) => {
    let api = new ApiService();
    let user = LocalDataService.load_user_data();

    if (timerId.current) {
      clearInterval(timerId.current);
    }
    if (clearTimerId.current) {
      clearTimeout(clearTimerId.current);
    }
    // 检查弹框是否可见
    if (!isVisible) {
      return;
    }

    if (playTypeIndex == 0) {
      let res = await api.create_wx_order_info(user.token, id);
      setQrcode(`data:image/png;base64,${res.img_b64}`)
      setPayTitle('微信支付')
      timerId.current = setInterval(() => {
        get_order_info(res.order_info.out_trade_no);
      }, 1000);
      clearTimerId.current = setTimeout(() => {
        clearInterval(timerId.current);
      }, 5 * 60 * 1000);  // 5 minutes
    } else if (playTypeIndex == 1) {
      let res = await api.create_alipay_order_info(user.token, id);
      setQrcode(`data:image/png;base64,${res.img_b64}`)
      setPayTitle('支付宝支付')
      timerId.current = setInterval(() => {
        get_order_info(res.order_info.out_trade_no);
      }, 1000);
      clearTimerId.current = setTimeout(() => {
        clearInterval(timerId.current);
      }, 5 * 60 * 1000);  // 5 minutes
    }


  };

  const get_order_info = async (out_trade_no) => {
    console.log(out_trade_no, 'out_trade_no');
    let api = new ApiService();
    let user = LocalDataService.load_user_data();
    let res = await api.get_order_info(user.token, out_trade_no);
    if (!res) {
      handleClose()
      toast.error('支付失败，请重新支付')
      clearInterval(timerId.current);
      return
    }
    if (res.status == 2) {
      handleClose()
      toast('支付成功')
      clearInterval(timerId.current);
      updateMenu()
    }

  }

  useImperativeHandle(ref, () => ({
    showModal: () => {
      setIsVisible(true);
      // 每次打开组件时更新二维码
      if (shopList.length > 0) {
        creatPayInfo(shopList[shopListIndex].id);
      }
    },
  }));

  // 关闭弹窗
  const handleClose = () => {
    setIsVisible(false);
    // 清除定时器
    if (timerId.current) {
      clearInterval(timerId.current);
    }
    if (clearTimerId.current) {
      clearTimeout(clearTimerId.current);
    }
  };


  return (
    <>
      {isVisible && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <div className='cloise-custom' onClick={handleClose}>
              <img className='cloise-custom-icon' src='https://video-translate-web.oss-cn-beijing.aliyuncs.com/image/close.png' />
            </div>
            <div className='custom-modal-top'></div>
            <div className='custom-modal-title'>
              <div className='custom-modal-title-content'>
                <img className='custom-modal-title-icon' src='https://video-translate-web.oss-cn-beijing.aliyuncs.com/image/purchaseSvipNavIcon.png' />
                超级会员
              </div>
            </div>
            <div className='custom-modal-content'>

              <div className='custom-shops-list'>
                {
                  shopList.map((item, index) => (
                    <div
                      className={`custom-shops-info ${shopListIndex == index ? 'vpd_price_choos' : ''}`}
                      onClick={() => {
                        setShopListIndex(index)
                      }}
                      key={index}>
                      {
                        item.tag.length > 0 &&
                        <div className='limit_discount'> {item.tag}</div>
                      }
                      <div className='custom-shops-title'>{item.title}</div>
                      <div className='custom-shops-num-old'> ￥{item.coin / 100}</div>
                      <div className='custom-shops-num'> ￥{item.money / 100}</div>
                      <div className='custom-shops-tips'>{item.sub_title}</div>
                      <div className='custom-shops-tips' dangerouslySetInnerHTML={{ __html: item.content }}></div>
                      {/* <div className='custom-shops-time'>{item.}</div> */}
                    </div>
                  ))
                }
              </div>
              <div className='custom-code'>
                <div className='custom-code-img'>
                  <img src={qrcode} />
                </div>
                <div className='custom-play-type-content'>
                  <div className={`custom-play-type-info ${playTypeIndex == 0 ? 'custom-play-type-info-active' : ''}`}
                    onClick={() => setPlayTypeIndex(0)

                    }
                  >
                    <img src='https://video-img.fyshark.com/1702283061156weixin.png' />
                    {playTypeIndex == 0 ? '微信支付' : '微信'}
                  </div>
                  <div className={`custom-play-type-info ${playTypeIndex == 1 ? 'custom-play-type-info-active' : ''}`}
                    onClick={() => setPlayTypeIndex(1)}
                  >
                    <img src='https://video-img.fyshark.com/1702284888116zhifubao.png' />
                    {playTypeIndex == 1 ? '支付宝支付' : '支付宝'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default VipBox;