import React, { useState } from 'react';
import './AIKefu.css';
import { XCircle } from 'react-bootstrap-icons';

let ipcRenderer;
if (typeof window !== 'undefined' && window.require) {
  ipcRenderer = window.require('electron').ipcRenderer;
}

const AIKefu = () => {
  const [minimized, setMinimized] = useState(false);

  const handleKefuClick = () => {
    // 使用window.open打开新标签页
    ipcRenderer.invoke('open-url', 'https://www.coze.cn/s/pSeptjkgA94/');
  };

  const toggleMinimize = (e) => {
    e.stopPropagation();
    setMinimized(!minimized);
  };

  const containerStyle = minimized 
    ? { width: '40px', height: '40px', opacity: 0.7 } 
    : {};

  const iconStyle = minimized 
    ? { width: '30px', height: '30px' } 
    : {};

  return (
    <div 
      className="ai-kefu-container" 
      onClick={handleKefuClick} 
      title="点击咨询AI客服"
      style={containerStyle}
    >
      <img
        src="https://video-translate-web.oss-cn-beijing.aliyuncs.com/image/AIKefu.gif"
        alt="AI客服"
        className="ai-kefu-icon"
        style={iconStyle}
      />
      <div className="ai-kefu-text">AI客服</div>
      {!minimized && (
        <div 
          style={{
            position: 'absolute',
            top: '-10px',
            right: '-10px',
            background: 'white',
            borderRadius: '50%',
            cursor: 'pointer',
            zIndex: 1101,
          }}
          onClick={toggleMinimize}
          title="最小化"
        >
          <XCircle size={20} color="#9370DB" />
        </div>
      )}
      {minimized && (
        <div 
          style={{
            position: 'absolute',
            bottom: '-15px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'white',
            borderRadius: '50%',
            padding: '3px',
            cursor: 'pointer',
            zIndex: 1101,
            fontSize: '10px',
            color: '#9370DB',
            boxShadow: '0 2px 4px rgba(147, 112, 219, 0.3)',
          }}
          onClick={toggleMinimize}
          title="展开"
        >
          +
        </div>
      )}
    </div>
  );
};

export default AIKefu; 