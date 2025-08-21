import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { Button, Nav, Modal, Form, Dropdown, Row, Col } from 'react-bootstrap';
import ApiService from '../../api/ApiService';
import LocalDataService from '../../api/LocalDataService';
import { useHistory } from 'react-router-dom';
import './UserProfile.css'
import QRCode from 'qrcode';
import { toast } from 'react-toastify';

const UserProfile = forwardRef((props, ref) => {
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [verificationTimeout, setVerificationTimeout] = useState(60);
  const [isLoadingVerification, setLoadingVerification] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('')
  const [code, setCode] = useState('')
  const api = new ApiService();
  //发送验证码状态
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const timerId = useRef(null);
  const clearTimerId = useRef(null);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [playTypeIndex, setPlayTypeIndex] = useState(0);


  // 处理验证码按钮点击事件
  const handleVerificationClick = async () => {

    if (phoneNumber == '') {
      toast.error('请输入手机号')
      return
    }
    let res = await api.get_message_code(phoneNumber, 1, 1)
    if (res.code != 200) {
      toast.error(JSON.stringify(res))
      return
    }

    setIsButtonDisabled(true);
    setCountdown(60);
    // 这里可以加入发送验证码的逻辑

    // 开始倒计时
    const interval = setInterval(() => {
      setCountdown(prevCountdown => {
        if (prevCountdown === 1) {
          clearInterval(interval);
          setIsButtonDisabled(false);
          return 0;
        } else {
          return prevCountdown - 1;
        }
      });
    }, 1000);

  };



  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
  };


  //验证码状态
  const [isPasswordLogin, setIsPasswordLogin] = useState(false);

  const toggleLoginMethod = () => {
    setIsPasswordLogin(!isPasswordLogin);
  };

  const history = useHistory();
  // 登录处理
  const handleLogin = async (event) => {

    event.preventDefault();
    const formData = new FormData(event.target);
    const phoneNumber = formData.get('phoneNumber');
    const password = formData.get('password');
    const phoneCode = formData.get('verificationCode');

    try {
      let user = null;
      if (isPasswordLogin) {
        user = await api.login(phoneNumber, password);
      } else {
        user = await api.login_message(phoneNumber, 1, 1, phoneCode);
      }

      console.log('Logged in user:', user);
      setShowLoginModal(false);
      setUser(user);
      LocalDataService.set_user_data(user);
      history.push('/batchList');
    } catch (error) {
      toast.error(`登录失败: ${error.data}`);
    }
  };
  //供父组件调用
  useImperativeHandle(ref, () => ({
    showLoginModal: () => {
      setShowLoginModal(true);
    },
    // 你可以在这里添加更多子组件的方法
  }));

  useEffect(() => {
    let user_info = LocalDataService.load_user_data();
    setUser(user_info);
    get_qrcode()

    return () => {
      // 清除定时器
      if (timerId.current) {
        clearInterval(timerId.current);
      }
      if (clearTimerId.current) {
        clearTimeout(clearTimerId.current);
      }
    };
  }, [showLoginModal]);

  // useImperativeHandle(ref, () => ({
  //   showModal: () => {
  //     setIsVisible(true);
  //     get_qrcode()
  //   },
  // }));

  const get_qrcode = async () => {
    console.log('登录定时器');

    const api = new ApiService();

    // 清除定时器
    if (timerId.current) {
      clearInterval(timerId.current);
    }
    if (clearTimerId.current) {
      clearTimeout(clearTimerId.current);
    }
    // 检查弹框是否可见
    if (!showLoginModal) {
      return;
    }

    let res = await api.get_qrcode()
    if (res.url) {
      // 使用 qrcode 库生成二维码数据
      QRCode.toDataURL(res.url, (err, url) => {
        if (err) {
          console.error(err);
          return;
        }
        setQrCodeUrl(url);
        timerId.current = setInterval(() => {
          get_order_info(res.scene_id);
        }, 1000);
        clearTimerId.current = setTimeout(() => {
          clearInterval(timerId.current);
        }, 5 * 60 * 1000);
      });
    }


  }

  const get_order_info = async (scene_id) => {
    console.log(scene_id, 'scene_id');
    let api = new ApiService();
    let res = await api.check_qrcode_status(scene_id);
    console.log(res, 'res333');

    if (!res) {
      toast.error('扫码失败，请重新扫码')
      clearInterval(timerId.current);
      return
    }
    if (res.code == 200) {
      toast('登录成功')
      clearInterval(timerId.current);
      setShowLoginModal(false);
      setUser(res.data);
      LocalDataService.set_user_data(res.data);
      history.push('/batchList');
    }

  }

  // 注册处理
  const handleRegister = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const name = formData.get('name');
    const phoneNumber = formData.get('phoneNumber');
    const password = formData.get('password');
    const uParam = localStorage.getItem('from');
    let from_id = uParam || 0;


    try {
      const user = await api.register2(name, phoneNumber, password, from_id, 1, 0, code);
      console.log('Registered user:', user);
      setShowRegisterModal(false);
      handleCloseRegisterModal()
      handleCloseLoginModal()
      setUser(user);
      LocalDataService.set_user_data(user);
      history.push('/batchList');
    } catch (error) {
      // toast.error(`注册失败: ${error.data}`);
    }
  };

  // 登录弹窗控制
  const handleShowLoginModal = () => {
    setShowLoginModal(true);
  };

  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
  };

  // 注册弹窗控制
  const handleShowRegisterModal = () => {
    setShowRegisterModal(true);
  };

  const handleCloseRegisterModal = () => {
    setShowRegisterModal(false);
  };


  // 登出处理
  const handleLogout = () => {
    history.push('/');
    setUser(null);
    LocalDataService.set_user_data(null);
  };

  const startCountdown = () => {
    setLoadingVerification(true);
    const startTime = Date.now();

    const intervalId = setInterval(() => {
      const passedTime = Date.now() - startTime;

      if (passedTime >= 60000) {
        clearInterval(intervalId);
        setLoadingVerification(false);
      }
      setVerificationTimeout(60 - Math.round(passedTime / 1000));
    }, 1000);
  }

  const handleSendVerificationCode = async () => {
    const api = new ApiService();
    console.log(phoneNumber, 'phoneNumber');
    try {
      const res = await api.get_message_code(phoneNumber, 1, 0);
      console.log(res, 'resres');
      toast.success('验证码已发送，请查收');
      startCountdown();
    } catch (error) {
      toast.error(`发送验证码失败: ${error}`);
    }
  };

  return (
    <>
      {/* {user ? (
        <Nav.Item className="user-title">
          <span className="user-name" >你好, {user.name}</span>
          
          <div className='login-botton' onClick={handleLogout}>注销</div>
        </Nav.Item>
      ) : (
        <div>
          <div className='login-botton' onClick={handleShowLoginModal}>登录</div>
        </div>
      )} */}

      {/* 登录弹窗 */}
      <Modal show={showLoginModal} centered>
        <Modal.Header >
          <Modal.Title>用户登录</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className='login-type'>

            <div className='custom-play-type-content '>
              <div className={`custom-play-type-info ${playTypeIndex == 0 ? 'custom-play-type-info-active' : ''}`}
                onClick={() => setPlayTypeIndex(0)

                }
              >
                <img src='https://video-img.fyshark.com/1702283061156weixin.png' />
                {playTypeIndex == 0 ? '微信登录' : '微信'}
              </div>
              <div className={`custom-play-type-info ${playTypeIndex == 1 ? 'custom-play-type-info-active' : ''}`}
                onClick={() => setPlayTypeIndex(1)}
              >
                <img src='https://video-translate-web.oss-cn-beijing.aliyuncs.com/image/phone.png' />
                {playTypeIndex == 1 ? '手机号登录' : '手机号'}
              </div>
            </div>
          </div>
          {
            playTypeIndex == 0 ?
              <div className='weixin-code'>
                {qrCodeUrl && (
                  <div className='weixin-code-image'>
                    <img src={qrCodeUrl} alt="QR Code" />
                  </div>
                )}
              </div>
              :
              <Form onSubmit={handleLogin}>

                <Form.Group>
                  <Form.Label>手机号</Form.Label>
                  <Form.Control type="text" name="phoneNumber" required onChange={handlePhoneNumberChange} />
                </Form.Group>

                {isPasswordLogin ? (
                  <Form.Group>
                    <Form.Label column sm="2">密码</Form.Label>
                    <Form.Control type="password" name="password" required />
                  </Form.Group>
                ) : (
                  <Form.Group  >
                    <Form.Label column sm="2">验证码</Form.Label>
                    <Row>
                      <Col sm="7">
                        <Form.Control type="text" name="verificationCode" required />
                      </Col>
                      <Col sm="3" className='mt-1'>
                        <Button
                          variant={isButtonDisabled ? "secondary" : "primary"}
                          size="sm"
                          disabled={isButtonDisabled}
                          onClick={handleVerificationClick}
                        >
                          {isButtonDisabled ? `等待${countdown}秒` : '获取验证码'}
                        </Button>
                      </Col>
                    </Row>
                  </Form.Group>
                )}

                <div className='login-bottom' style={{ marginTop: '10px' }}>
                  <Button variant="primary" type="submit" >
                    登录
                  </Button>
                  {/* <Button variant="secondary" style={{ marginLeft: '5px' }}  onClick={handleShowRegisterModal}>
                注册
              </Button>
              <Button variant="link" onClick={toggleLoginMethod}>
                使用{isPasswordLogin ? "验证码" : "密码"}登录
              </Button> */}
                </div>
              </Form>
          }

        </Modal.Body>
      </Modal>

      {/* 注册弹窗 */}
      <Modal show={showRegisterModal} onHide={handleCloseRegisterModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>用户注册</Modal.Title>
        </Modal.Header>
        <Modal.Body className='user-content'>
          <Form onSubmit={handleRegister}>
            <Form.Group>
              <Form.Label>姓名:</Form.Label>
              <Form.Control type="text" name="name" required />
            </Form.Group>
            <Form.Group style={{ marginTop: '10px' }}>
              <Form.Label>手机号:</Form.Label>
              <Form.Control type="text" name="phoneNumber" required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
            </Form.Group>
            <Form.Group style={{ marginTop: '10px' }}>
              <Form.Label>手机验证码:</Form.Label>

              <div className='phone-code'>
                <Form.Control type="text" name="verificationCode" required value={code} onChange={(e) => setCode(e.target.value)} />
                <Button variant="primary" style={{ width: '60px', marginLeft: '10px' }} type="button" size="sm" onClick={handleSendVerificationCode} disabled={isLoadingVerification}>
                  {isLoadingVerification ? `${verificationTimeout}` : '获取'}
                </Button>
              </div>

            </Form.Group>

            <Form.Group style={{ marginTop: '10px' }}>
              <Form.Label>密码（最少6位）:</Form.Label>
              <Form.Control type="password" name="password" required />
            </Form.Group>
            <div className='login-bottom' style={{ marginTop: '10px' }}>

              <Button variant="primary" type="submit" size="sm">
                注册
              </Button>
            </div>
          </Form>
        </Modal.Body>

      </Modal >
    </>
  );
});

export default UserProfile;




