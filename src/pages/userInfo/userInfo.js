import React, { useEffect, useState, useRef } from 'react';
import './UserInfo.css'; // Assuming you have a CSS file for styling
import ApiService from '../../api/ApiService';
import { Modal, Button, Row, Col, FormControl, ButtonGroup, Card, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import LocalDataService from '../../api/LocalDataService';
import { toast } from 'react-toastify';
import SettingList from './setting';
import SetJianyinPathModal from '../batch/SetJianYinPathModal';
import VipBox from '../../components/vipBox';
import { 
  PersonCircle, 
  GearFill, 
  KeyFill, 
  Gift, 
  Clock, 
  Clipboard, 
  InfoCircle,
  StarFill,
  BoxArrowRight,
  ShieldLock,
  PencilSquare,
  CheckCircleFill
} from 'react-bootstrap-icons';

let ipcRenderer;
if (typeof window !== 'undefined' && window.require) {
  ipcRenderer = window.require('electron').ipcRenderer;
}

function UserInfo ({ userProfileRef }) {
  const history = useHistory();
  const [user_info, setUser_info] = useState({});
  const [shopList, setShopList] = useState([]);
  const [api_token, setApiToken] = useState('')
  const [uu_Code, setUu_Code] = useState('');
  const [showJianyinModal, setShowJianyinModal] = useState(false);
  const [showUpdateTokenModal, setShowUpdateTokenModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const vipBoxRef = useRef(null);

  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const [isMobile, setIsMobile] = useState(isMobileDevice);
  const [weapp, setWeapp] = useState(true);

  useEffect(() => {
    let from_app = LocalDataService.loadData('from');
    if (from_app == "webapp") {
      setWeapp(true);
    } else {
      setWeapp(false);
    }

    load_user_info();
    get_pay_info_list();

    return () => {};
  }, []);
  
  const get_pay_info_list = async () => {
    let api = new ApiService();
    let user = LocalDataService.load_user_data();
    let res = await api.get_pay_info_list(user.token, 0);
    setShopList(res);

    let res_token = await api.get_api_token(user.token, 1);
    if (res_token.code == 200) {
      setApiToken(res_token.api_token);
    }
  }

  const load_user_info = async () => {
    let api = new ApiService();
    let user = LocalDataService.load_user_data();
    let res = await api.get_user_info(user.token);
    if (res) {
      res.vip_time = res.vip_time.replace('T', ' ')
      setUser_info(res);
      LocalDataService.set_user_data(res);
    }
  }

  const handleLogout = () => {
    history.push('/');
    LocalDataService.set_user_data(null);
    userProfileRef.current.showLoginModal();
  };

  const unregister = () => {
    let api = new ApiService();
    let user = LocalDataService.load_user_data();
    api.unregister(user.token);
    history.push('/');
    LocalDataService.set_user_data(null);
  }

  const handleJianyinSettingClick = () => {
    if (ipcRenderer) {
      setShowJianyinModal(true);
    } else {
      toast.error('请下载客户端');
    }
  };

  const activateCode = async () => {
    if (uu_Code == '') {
      toast("请输入激活码！");
      return;
    }

    let api = new ApiService();
    let user = LocalDataService.load_user_data();
    try {
      let res = await api.consume_activation_code(user.token, 1, uu_Code);
      if (res.code == 200) {
        toast.success('激活成功');
        load_user_info();
      } else {
        toast.error(res.msg);
      }
    } catch (error) {
      toast.error(`请求失败：${error.data || '未知错误'}`);
    }
  }

  const handleOpenVipBox = () => {
    ipcRenderer.invoke('open-url', 'https://ts.fyshark.com/#/userInfo');
  };
  
  const updateMenu = () => {
    load_user_info();
  }

  const isValidPhoneNumber = (phone) => {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const handleUpdateApiToken = async () => {
    setShowUpdateTokenModal(true);
  };

  const confirmUpdateApiToken = async () => {
    let api = new ApiService();
    let user = LocalDataService.load_user_data();
    let res = await api.reset_api_token(user.token);
    if (res.code == 200) {
      toast.success('密钥已更新');
      get_pay_info_list();
    } else {
      toast.error(res.msg);
    }
    setShowUpdateTokenModal(false);
  };

  const cancelUpdateApiToken = () => {
    setShowUpdateTokenModal(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      toast.success('复制成功!');
      setTimeout(() => setCopySuccess(false), 2000);
    }, (err) => {
      toast.error('复制失败，请手动复制');
    });
  };

  return (
    <div className='user-info-container'>
      <div className='container'>
        <Card className="user-card mt-4 mb-4">
          <Card.Body>
            <div className='user-info-logout'>
              <div className='user-info-title'>
                <PersonCircle size={22} style={{ marginRight: '10px', color: '#9370DB' }} />
                个人中心
              </div>
              <div className='login-botton' onClick={handleLogout}>
                <BoxArrowRight size={14} style={{ marginRight: '5px' }} /> 退出登录
              </div>
            </div>

            <div className='user-info-content'>
              <div className='user-card-number'>
                <div className='number-circle'>
                  {user_info && user_info.name && user_info.name.charAt(0)}
                </div>
                {user_info.vip_level != 0 &&
                  <div className="vip-badge-container">
                    {/* <img
                      src={user_info.vip_level == 1 ? 'https://video-translate-web.oss-cn-beijing.aliyuncs.com/image/vip.png' : 'https://video-translate-web.oss-cn-beijing.aliyuncs.com/image/svip.png'}
                      alt="VIP"
                      className='vip-icon'
                    /> */}
                    <div className="vip-text-wrapper">
                      <StarFill size={10} style={{ marginRight: '4px', color: '#FFD700' }} />
                      <span className="vip-text">{user_info.vip_level == 1 ? 'VIP' : 'SVIP'}</span>
                    </div>
                  </div>
                }
              </div>

              <div className="user-details">
                <div className='user-detail-item'>
                  <PersonCircle size={16} style={{ marginRight: '8px', color: '#9370DB' }} />
                  <div className='user-detail-title'>昵称：<span style={{ fontWeight: 'normal' }}>{user_info.name}</span></div>
                </div>
                
                <div className='user-detail-item'>
                  <Badge bg="light" style={{ marginRight: '8px', backgroundColor: '#f5f0ff', color: '#8A2BE2', fontWeight: 'normal' }}>ID</Badge>
                  <div className='user-detail-title'>ID：<span style={{ fontWeight: 'normal' }}>{user_info.id}</span></div>
                </div>
                
                {isValidPhoneNumber(user_info.phone) &&
                  <div className='user-detail-item'>
                    <Badge bg="light" style={{ marginRight: '8px', backgroundColor: '#f5f0ff', color: '#8A2BE2', fontWeight: 'normal' }}>手机</Badge>
                    <div className='user-detail-title'>手机号：<span style={{ fontWeight: 'normal' }}>{user_info.phone}</span></div>
                  </div>
                }
                
                <div className='user-vip-detail'>
                  <Clock size={16} style={{ marginRight: '8px', color: '#9370DB' }} />
                  <div className='user-detail-title'>
                    会员有效期：
                    {user_info.vip_level ? (
                      <span style={{ color: '#8A2BE2', fontSize: '14px', fontWeight: '500' }}>{user_info.vip_time}</span>
                    ) : (
                      <span style={{ color: '#999' }}>非会员</span>
                    )}
                  </div>
                  <div className='user-get-vip' onClick={handleOpenVipBox}>
                    <StarFill size={12} style={{ marginRight: '4px' }} /> 立即续费
                  </div>
                </div>
              </div>
            </div>

            {weapp == true &&
              <div className='d-flex justify-content-center mt-3'>
                <Button variant="outline-danger" size="sm" onClick={unregister} className="px-3" style={{ fontSize: '13px' }}>
                  <ShieldLock size={12} style={{ marginRight: '4px' }} /> 注销账号
                </Button>
              </div>
            }
          </Card.Body>
        </Card>
      </div>

      {weapp == true &&
        <div className="container">
          <SettingList />
        </div>
      }

      <div className='container'>
        <Card className='user-info-item mt-4'>
          <Card.Body className='user-settings-content'>
            <div className='section-title'>
              <GearFill size={16} /> 剪映路径设置
            </div>
            <div className='setting-item'>
              <div style={{ flex: 1 }}>
                当前路径: 
                <span className="path-value">{LocalDataService.getDraftPath() || '未设置'}</span>
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip>设置剪映软件的草稿路径以导入草稿至剪映</Tooltip>}
                >
                  <InfoCircle className="hint-icon" size={14} />
                </OverlayTrigger>
              </div>
              <div className='setting-item-btn' onClick={handleJianyinSettingClick}>
                <PencilSquare size={12} style={{ marginRight: '4px' }} /> 设置路径
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      <div className='container'>
        <Card className='user-info-item mt-4'>
          <Card.Body>
            <div className='section-title'>
              <Gift size={16} /> 软件激活
            </div>
            <Row className="mb-2">
              <Col>
                <div className="input-group">
                  <FormControl
                    placeholder="请输入软件激活码"
                    value={uu_Code}
                    onChange={(e) => setUu_Code(e.target.value)}
                    style={{ borderTopLeftRadius: '20px', borderBottomLeftRadius: '20px', borderColor: '#e6d4f9' }}
                  />
                  <div className="input-group-append">
                    <Button 
                      variant="primary" 
                      onClick={activateCode} 
                      style={{ 
                        borderTopRightRadius: '20px', 
                        borderBottomRightRadius: '20px',
                        background: 'linear-gradient(45deg, #9370DB, #8A2BE2)',
                        border: 'none'
                      }}
                    >
                      激活软件
                    </Button>
                  </div>
                </div>
                <div className="mt-2 text-muted" style={{ fontSize: '12px' }}>
                  <InfoCircle size={12} style={{ marginRight: '4px', color: '#9370DB' }} />
                  激活码用于提升软件功能，可在官网或授权渠道获取
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </div>

      <div className='container'>
        <Card className='user-info-item mt-4 mb-5'>
          <Card.Body className='user-settings-content'>
            <div className='section-title'>
              <KeyFill size={16} /> API密钥管理
            </div>
            <div className='setting-item'>
              <div style={{ flex: 1, wordBreak: 'break-all' }}>
                <div style={{ fontWeight: '500', marginBottom: '5px', color: '#8A2BE2', display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                  API请求密钥
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip>用于API接口认证，请妥善保管</Tooltip>}
                  >
                    <InfoCircle className="hint-icon" size={12} />
                  </OverlayTrigger>
                </div>
                <div className="api-token-box">
                  {api_token}
                  <div className="copy-btn" onClick={() => copyToClipboard(api_token)}>
                    {copySuccess ? <CheckCircleFill size={12} style={{ color: '#28a745', marginRight: '3px' }} /> : <Clipboard size={12} style={{ marginRight: '3px' }} />}
                    {copySuccess ? '已复制' : '复制'}
                  </div>
                </div>
              </div>
              <div className='setting-item-btn' onClick={handleUpdateApiToken}>
                <KeyFill size={12} style={{ marginRight: '4px' }} /> 更新密钥
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      <Modal 
        show={showUpdateTokenModal} 
        onHide={cancelUpdateApiToken} 
        centered
        size="sm"
      >
        <Modal.Header closeButton style={{ borderBottom: '1px solid #f0ebfa', padding: '15px' }}>
          <Modal.Title style={{ color: '#8A2BE2', fontSize: '16px', fontWeight: '500' }}>
            <KeyFill size={16} style={{ marginRight: '8px' }}/>
            请确认是否更新密钥
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '15px' }}>
          <div className="alert alert-warning py-2" style={{ fontSize: '13px' }}>
            <InfoCircle size={14} style={{ marginRight: '6px' }}/>
            更新密钥后，所有使用此密钥的工作流（如云渲染节点）将全部失效，确定要更新吗？
          </div>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: '1px solid #f0ebfa', padding: '12px' }}>
          <Button variant="light" onClick={cancelUpdateApiToken} size="sm">
            取消
          </Button>
          <Button 
            variant="primary" 
            onClick={confirmUpdateApiToken} 
            size="sm"
            style={{ 
              background: 'linear-gradient(45deg, #9370DB, #8A2BE2)',
              border: 'none'
            }}
          >
            确认更新
          </Button>
        </Modal.Footer>
      </Modal>

      <SetJianyinPathModal show={showJianyinModal} handleClose={() => setShowJianyinModal(false)} />
      <VipBox ref={vipBoxRef} updateMenu={updateMenu} />
    </div>
  );
}

export default UserInfo;
