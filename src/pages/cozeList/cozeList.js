import React, { useEffect, useState, useRef } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import './cozeList.css';
import { XCircle } from 'react-bootstrap-icons';
import ApiService from '../../api/ApiService';
import UserProfile from '../user/UserProfile';

function CozeList () {
  const [apps, setApps] = useState([]);
  const [page, setPage] = useState(1);
  const [page_size, setpage_size] = useState(20)
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const containerRef = useRef(null);
  const api = new ApiService();

  let ipcRenderer;
  if (typeof window !== 'undefined' && window.require) {
    ipcRenderer = window.require('electron').ipcRenderer;
  }

  const loadApps = async (page) => {
    setLoading(true);
    try {

      let cozeList = await api.get_draft_template(page, page_size);
      console.log(cozeList, 'cozeList');

      // 模拟分页逻辑
      if (page > 2) {
        setHasMore(false); // 假设只有两页数据
      } else {
        setApps((prevApps) => [...prevApps, ...cozeList.data]);
        setPage((prevPage) => prevPage + 1);
      }
    } catch (error) {
      console.error('Failed to load apps:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApps(page);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const handleScroll = () => {
      if (container.scrollTop + container.clientHeight >= container.scrollHeight - 20 && !loading && hasMore) {
        loadApps(page);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [loading, hasMore, page]);

  const toOfficial = (url) => {
    ipcRenderer.invoke('open-url', url);
  }

  return (
    <div className='coze-list-home' ref={containerRef}>
      <div className='coze-list-app-list'>
        {apps.map((app, index) => (
          <div key={index} className='coze-list-app-item'>
            {
              !app.isOfficial &&
              <div className='coze-to-jianyin-content-video-box-title'>
                官方
              </div>
            }
            <video controls className='coze-list-app-video'>
              <source src={app.video_url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className='coze-list-app-description' onClick={() => toOfficial(app.url)}>
              <div className='coze-list-info-title'>
                {app.title.length > 10 ? `${app.title.substring(0, 10)}...` : app.title}
              </div>
              <div className='tocoze'>
                {`立即使用模板>>`}
              </div>
            </div>
          </div>
        ))}
        {loading && <div className='coze-list-loading'>Loading...</div>}
        {!hasMore && <div className='coze-list-no-more'>No more apps to load</div>}
      </div>
    </div>
  );
}

export default CozeList;