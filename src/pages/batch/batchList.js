import React, { useState, useRef, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { toast } from 'react-toastify';
import { Button, Form, Spinner, Card, Badge, Carousel } from 'react-bootstrap';
import ApiService from '../../api/ApiService';
import LocalDataService from '../../api/LocalDataService';
import './ContentDisplay.css';
import { useLocation } from 'react-router-dom';
import SetJianyinPathModal from './SetJianYinPathModal';
import VipBox from '../../components/vipBox';

let ipcRenderer;
if (typeof window !== 'undefined' && window.require) {
  ipcRenderer = window.require('electron').ipcRenderer;
}

const BatchList = () => {
  const [url, setUrl] = useState('');
  const [progress, setProgress] = useState({ audio: { total: 0, downloaded: 0 }, video: { total: 0, downloaded: 0 } });
  const [isLoading, setIsLoading] = useState(false);
  const [showJianyinModal, setShowJianyinModal] = useState(false);
  const location = useLocation();
  const vipBoxRef = useRef(null);
  const [maxCount, setMaxCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const apiService = new ApiService();
  const [version, setVersion] = useState('1.0.0');
  const [openAfterDownload, setOpenAfterDownload] = useState(LocalDataService.getAutoOpenDraft());
  const [showPosterOverlay, setShowPosterOverlay] = useState(false);
  const [showPoster, setShowPoster] = useState(true);
  const [downloadLogs, setDownloadLogs] = useState([]);
  const logEndRef = useRef(null);
  const [downloadCounts, setDownloadCounts] = useState({
    success: 0,
    failed: 0,
    total: 0
  });
  const [homeContent, setHomeContent] = useState(null);
  const [hasNewVersion, setHasNewVersion] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');

  // 比较版本号的函数
  const compareVersions = (v1, v2) => {
    const v1Parts = v1.split('.').map(Number);
    const v2Parts = v2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const v1Part = v1Parts[i] || 0;
      const v2Part = v2Parts[i] || 0;
      
      if (v1Part > v2Part) return 1;
      if (v1Part < v2Part) return -1;
    }
    
    return 0;
  };

  // 打开外部链接的函数
  const openExternalLink = (url) => {
    if (typeof ipcRenderer !== 'undefined') {
      ipcRenderer.invoke('open-url', url);
    } else {
      window.open(url, '_blank');
    }
  };

  useEffect(() => {
    const userInfo = LocalDataService.load_user_data();
    ipcRenderer.invoke('get-app-version').then(version => {
      setVersion(version);
    });
    if (!userInfo) {
      toast.error("请先登录");
      return;
    }
    
    // 获取草稿记录
    apiService.get_jydraft_record(userInfo.token, 1, 1, 10)
      .then(response => {
        setMaxCount(response.max_count);
        setTotalCount(response.today_count);
      })
      .catch(error => {
        toast.error("获取草稿列表失败！错误信息：" + error.message);
      });
    
    // 获取首页内容
    apiService.get_assistant_home_content(userInfo.token)
      .then(response => {
        setHomeContent(response);
        console.log("首页内容获取成功", response);
        
        // 检查版本更新
        if (response && response.data && response.data.jy_version) {
          const serverVersion = response.data.jy_version;
          
          ipcRenderer.invoke('get-app-version').then(localVersion => {
            if (compareVersions(serverVersion, localVersion) > 0) {
              setHasNewVersion(true);
              setDownloadUrl(response.data.jy_download_url || '');
            }
          });
        }
      })
      .catch(error => {
        console.error("获取首页内容失败：", error);
      });
  }, []);

  useEffect(() => {
    if (typeof ipcRenderer !== 'undefined') {
      ipcRenderer.send('batchList-ready');
      ipcRenderer.on('navigate-to-batchList', (event, drafId) => {
        console.log('navigate-to-batchList', drafId);
        setUrl(drafId);
      });

      return () => {
        ipcRenderer.removeAllListeners('navigate-to-batchList');
      };
    }
  }, []);

  // 滚动到日志底部的效果
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [downloadLogs]);

  useEffect(() => {
    // 下载进度事件处理
    ipcRenderer.on('download-progress', (event, data) => {
      setIsLoading(true);
      setProgress(prevProgress => ({
        ...prevProgress,
        [data.type]: { total: data.total, downloaded: data.downloaded, index: data.index, url_total: data.url_total }
      }));
      
      // 添加到日志
      addLog(`下载进度: 当前第${data.index}/${data.url_total} - ${data.type === 'audio' ? '音频' : '视频'} ${data.downloaded}/${data.total}`);
    });

    // 下载完成事件处理
    ipcRenderer.on('download-complete', (event, data) => {
      setIsLoading(false);
      toast.success('剪映草稿下载完成！请前往剪映查看');
      addLog('✅ 下载完成: 剪映草稿已成功下载');
      
      // 更新成功计数
      if (data && data.success !== undefined) {
        setDownloadCounts(prev => ({
          ...prev,
          success: data.success,
          failed: data.failed,
          total: data.total
        }));
      } else {
        setDownloadCounts(prev => ({
          ...prev,
          success: prev.success + 1
        }));
      }
    });

    // 下载错误事件处理
    ipcRenderer.on('download-error', (event, data) => {
      setIsLoading(false);
      toast.error('剪映草稿下载失败！错误信息：' + data.error);
      addLog(`❌ 下载失败: ${data.error}`);
      
      // 更新失败计数
      setDownloadCounts(prev => ({
        ...prev,
        failed: prev.failed + 1
      }));
    });

    // 添加下载日志事件监听器
    ipcRenderer.on('download-log', (event, data) => {
      addLog(data.message);
    });

    // 文件下载计数事件
    ipcRenderer.on('file-download-count', (event, data) => {
      if (data) {
        setDownloadCounts(prev => ({
          ...prev,
          total: data.total || prev.total,
          success: data.success !== undefined ? data.success : prev.success,
          failed: data.failed !== undefined ? data.failed : prev.failed
        }));
      }
    });

    return () => {
      ipcRenderer.removeAllListeners('download-progress');
      ipcRenderer.removeAllListeners('download-complete');
      ipcRenderer.removeAllListeners('download-error');
      ipcRenderer.removeAllListeners('download-log');
      ipcRenderer.removeAllListeners('file-download-count');
    };
  }, []);

  // 添加日志的函数
  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    let type = 'info';
    
    // 根据消息内容确定日志类型
    if (message.includes('失败') || message.includes('错误')) {
      type = 'error';
    } else if (message.includes('完成') || message.includes('成功')) {
      type = 'success';
    } else if (message.includes('开始') || message.includes('正在')) {
      type = 'process';
    }
    
    setDownloadLogs(prevLogs => [...prevLogs, { time: timestamp, message, type }]);
  };

  // 清除日志的函数
  const clearLogs = () => {
    setDownloadLogs([]);
    setDownloadCounts({
      success: 0,
      failed: 0,
      total: 0
    });
  };

  const handleOpen = (openAfterDownload) => {
    if (!LocalDataService.load_user_data()) {
      toast.error("请先登录")
      return
    }

    if (!LocalDataService.getDraftPath()) {
      setShowJianyinModal(true);
      return
    }

    if (totalCount >= maxCount) {
      handleOpenVipBox()
      return
    }

    // 清除之前的日志
    clearLogs();
    
    // 添加开始下载的日志
    addLog('🚀 开始下载剪映草稿...');

    // 计算待下载的URL数量（根据换行符分割）
    const urlLines = url.split('\n').filter(line => line.trim() !== '');
    if (urlLines.length > 0) {
      setDownloadCounts(prev => ({
        ...prev,
        total: urlLines.length
      }));
    }

    let data = {
      url: url,
      destPath: LocalDataService.getDraftPath(),
      user_info: LocalDataService.load_user_data(),
      openAfterDownload: openAfterDownload
    }
    ipcRenderer.invoke('download-json-and-resources', data)
    setIsLoading(true);
  };

  const handleChange = (e) => {
    setUrl(e.target.value);
  };

  // 处理快速输入按钮点击
  const handleQuickInput = (draftUrl) => {
    setUrl(draftUrl);
  };

  const handleOpenVipBox = () => {
    vipBoxRef.current.showModal();
  };

  const updateMenu = () => {

  }

  const handleSwitchChange = (e) => {
    const newValue = e.target.checked;
    setOpenAfterDownload(newValue);
    LocalDataService.setAutoOpenDraft(newValue);
  };

  const handlePosterClick = () => {
    setShowPoster(true);
  };
  
  const handleClosePoster = () => {
    setShowPoster(false);
  };

  // Banner点击处理函数
  const handleBannerClick = (banner) => {
    // 优先使用goto_url字段作为跳转链接
    if (banner.goto_url) {
      openExternalLink(banner.goto_url);
    } 
    // 向下兼容，如果没有goto_url但desc以http开头，也可以跳转
    else if (banner.desc && banner.desc.startsWith('http')) {
      openExternalLink(banner.desc);
    }
  };

  return (
    <div className="container mt-4 batch-list-home">
      <div className='batch-list-home-header mb-4'>
        {homeContent && homeContent.data && homeContent.data.activity_banner_list && homeContent.data.activity_banner_list.length > 0 && (
          <Carousel 
            interval={5000} 
            indicators={homeContent.data.activity_banner_list.length > 1}
            controls={homeContent.data.activity_banner_list.length > 1}
          >
            {homeContent.data.activity_banner_list.map((banner, index) => (
              <Carousel.Item key={banner.id || index}>
                <div 
                  onClick={() => handleBannerClick(banner)} 
                  style={{ cursor: 'pointer' }}
                >
                  <img
                    className="d-block w-100"
                    src={banner.img_url}
                    alt={banner.name || `活动图片${index + 1}`}
                    style={{ 
                      borderRadius: '8px', 
                      maxHeight: '200px', 
                      objectFit: 'cover',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </div>
              </Carousel.Item>
            ))}
          </Carousel>
        )}
      </div>
      <Form.Group controlId="formUrl">
        <Form.Control
          as="textarea"
          rows={8}
          placeholder="输入草稿地址，多个使用回车换行分隔，例如：&#10;草稿地址1&#10;草稿地址2&#10;草稿地址3"
          value={url}
          onChange={handleChange}
        />
      </Form.Group>
      
      {/* 快速输入按钮区域 */}
      {homeContent && homeContent.data && homeContent.data.case_draft_list && homeContent.data.case_draft_list.length > 0 && (
        <div className="quick-input-buttons mt-3 mb-3">
          <div className="d-flex align-items-center flex-wrap">
            <div className="d-flex align-items-center me-3 mb-2">
              <i className="bi bi-lightning-fill text-primary me-1"></i>
              <span className="text-muted">案例草稿:</span>
            </div>
            <div className="d-flex flex-wrap align-items-center">
              {homeContent.data.case_draft_list.map(item => (
                <Button 
                  key={item.id} 
                  variant="outline-primary" 
                  size="sm" 
                  className="me-2 mb-2 rounded-pill draft-btn"
                  onClick={() => handleQuickInput(item.draft_url)}
                >
                  {item.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <Form.Check
        type="switch"
        id="open-path-switch"
        label="下载后打开草稿路径文件"
        checked={openAfterDownload}
        onChange={handleSwitchChange}
        className="mt-3"
      />
      <div className='d-flex justify-content-center mt-3'>
        <Button
          variant="primary"
          className="w-100"
          disabled={url.length === 0 || isLoading}
          onClick={() => handleOpen(openAfterDownload)}>
          {isLoading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              资源下载中...
            </>
          ) : (
            '创建剪映草稿'
          )}
        </Button>
      </div>
      
      {/* 下载进度显示 */}
      {isLoading && (
        <div className="mt-3 text-center">
          <p>
            当前下载进度: {progress.audio.index}/{progress.audio.url_total} | 
            音频下载进度: {progress.audio.downloaded}/{progress.audio.total} | 
            视频下载进度: {progress.video.downloaded}/{progress.video.total}
          </p>
        </div>
      )}

      {/* 下载日志显示区域 */}
      <Card className="mt-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">下载日志</h5>
          <Button variant="outline-secondary" size="sm" onClick={clearLogs}>
            清除日志
          </Button>
        </Card.Header>
        <Card.Body style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {downloadLogs.length === 0 ? (
            <p className="text-muted text-center">暂无日志记录</p>
          ) : (
            <div className="download-logs">
              {downloadLogs.map((log, index) => (
                <div key={index} className="log-entry">
                  <span className="log-time">[{log.time}]</span>
                  <span className={`log-message log-${log.type}`}>{log.message}</span>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          )}
        </Card.Body>
      </Card>

      <SetJianyinPathModal show={showJianyinModal} handleClose={() => setShowJianyinModal(false)} />
      <VipBox ref={vipBoxRef} updateMenu={updateMenu} />
      
      {/* 版本信息 */}
      <div className='batch-list-home-footer'>
        <div className="d-flex justify-content-center align-items-center w-100">
          <span className="me-3">当前版本号：{version}</span>
          {hasNewVersion && (
            <div onClick={() => openExternalLink(downloadUrl)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Badge bg="danger" className="me-1">新</Badge>
              <span className="text-primary">发现新版本 {homeContent?.data?.jy_version}，点击更新</span>
            </div>
          )}
        </div>
      </div>

      {/* {showPoster && (
        <div className="poster-container">
          <div className="poster" onClick={handlePosterClick}>
            <button 
              className="poster-close-btn" 
              onClick={(e) => {
                e.stopPropagation();
                handleClosePoster();
              }}
              aria-label="关闭海报"
            >
              ×
            </button>
            <img
              src="https://video-translate-web.oss-cn-beijing.aliyuncs.com/image/jinqun.jpg"
              alt="活动海报"
              className="poster-image"
            />
          </div>
        </div>
      )} */}
    </div>
  );
};

export default BatchList;