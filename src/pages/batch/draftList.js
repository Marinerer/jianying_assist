import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { toast } from 'react-toastify';
import { Card, Badge, ListGroup, Spinner, Pagination, OverlayTrigger, Tooltip } from 'react-bootstrap';
import ApiService from '../../api/ApiService';
import LocalDataService from '../../api/LocalDataService';
import { 
  CheckCircleFill, 
  ClockFill, 
  HourglassSplit, 
  QuestionCircleFill,
  CalendarCheckFill,
  CollectionPlayFill,
  ClockHistory,
  CloudDownloadFill,
  StarFill,
  Clipboard
} from 'react-bootstrap-icons';

let ipcRenderer;
if (typeof window !== 'undefined' && window.require) {
  ipcRenderer = window.require('electron').ipcRenderer;
}

const DraftList = () => {
  const [drafts, setDrafts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [todayCount, setTodayCount] = useState(0);
  const [maxCount, setMaxCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 20;
  const apiService = new ApiService();

  useEffect(() => {
    const userInfo = LocalDataService.load_user_data();
    if (!userInfo) {
      toast.error("请先登录");
      return;
    }

    setIsLoading(true);
    apiService.get_jydraft_record(userInfo.token,1, currentPage, itemsPerPage)
      .then(response => {
        setDrafts(response.data);
        setTodayCount(response.today_count);
        setMaxCount(response.max_count);
        setTotalCount(response.total_count);
        setTotalPages(Math.ceil(response.total_count / itemsPerPage));
        setIsLoading(false);
      })
      .catch(error => {
        toast.error("获取草稿列表失败！错误信息：" + error.message);
        setIsLoading(false);
      });
  }, [currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxPagesToShow = 5;
    const halfPagesToShow = Math.floor(maxPagesToShow / 2);

    let startPage = Math.max(1, currentPage - halfPagesToShow);
    let endPage = Math.min(totalPages, currentPage + halfPagesToShow);

    if (currentPage <= halfPagesToShow) {
      endPage = Math.min(totalPages, maxPagesToShow);
    } else if (currentPage + halfPagesToShow >= totalPages) {
      startPage = Math.max(1, totalPages - maxPagesToShow + 1);
    }

    if (startPage > 1) {
      items.push(<Pagination.Ellipsis key="start-ellipsis" />);
    }

    for (let page = startPage; page <= endPage; page++) {
      items.push(
        <Pagination.Item
          key={page}
          active={page === currentPage}
          onClick={() => handlePageChange(page)}
        >
          {page}
        </Pagination.Item>
      );
    }

    if (endPage < totalPages) {
      items.push(<Pagination.Ellipsis key="end-ellipsis" />);
    }

    return items;
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 0: return <QuestionCircleFill className="me-2" style={{ color: '#666' }} />;
      case 1: return <HourglassSplit className="me-2" style={{ color: '#1890ff' }} />;
      case 2: return <ClockFill className="me-2" style={{ color: '#faad14' }} />;
      case 7: return <CheckCircleFill className="me-2" style={{ color: '#52c41a' }} />;
      default: return <QuestionCircleFill className="me-2" style={{ color: '#d9d9d9' }} />;
    }
  };

  const renderStatus = (status) => {
    const statusMap = {
      0: '未提交',
      1: '等待中',
      2: '渲染中',
      5: '渲染失败',
      7: '渲染完成'
    };
    const statusColors = {
      0: '#666',
      1: '#1890ff',
      2: '#faad14',
      5: '#dc3545',
      7: '#52c41a'
    };

    return (
      <Badge 
        bg="light" 
        style={{ 
          color: statusColors[status] || '#d9d9d9', 
          borderRadius: '12px', 
          padding: '6px 10px',
          fontWeight: '500',
          border: `1px solid ${statusColors[status] || '#d9d9d9'}`,
          backgroundColor: `${statusColors[status]}15`
        }}
      >
        {getStatusIcon(status)}
        {statusMap[status] || '未知状态'}
      </Badge>
    );
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success("已复制到剪贴板");
      })
      .catch(err => {
        toast.error("复制失败: " + err);
      });
  };

  if (isLoading) {
    return (
      <div 
        className="d-flex flex-column align-items-center justify-content-center" 
        style={{ 
          height: '70vh', 
          backgroundColor: 'rgba(147, 112, 219, 0.05)', 
          padding: '30px',
          borderRadius: '16px',
          boxShadow: '0 3px 12px rgba(147, 112, 219, 0.08)'
        }}
      >
        <Spinner 
          animation="border" 
          variant="primary" 
          style={{ 
            color: '#9370DB',
            width: '3rem',
            height: '3rem',
            marginBottom: '15px'
          }} 
        />
        <span style={{ color: '#8A2BE2', fontWeight: '500' }}>加载草稿列表中，请稍候...</span>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('zh-CN', options).replace(/\//g, '-');
  };

  return (
    <div className="container py-4">
      <Card 
        className="mb-4" 
        style={{ 
          borderRadius: '16px', 
          border: 'none',
          boxShadow: '0 3px 12px rgba(147, 112, 219, 0.08)',
          transition: 'all 0.3s ease',
        }}
      >
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 
              style={{ 
                color: '#8A2BE2', 
                fontSize: '22px', 
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <CollectionPlayFill className="me-2" /> 草稿历史记录
            </h3>
            <div 
              className="draft-counter" 
              style={{ 
                backgroundColor: 'rgba(147, 112, 219, 0.1)', 
                padding: '8px 15px', 
                borderRadius: '30px',
                display: 'flex',
                alignItems: 'center',
                fontSize: '14px'
              }}
            >
              <CloudDownloadFill className="me-2" style={{ color: '#9370DB' }} />
              <span>今日下载: </span>
              <span 
                style={{ 
                  fontWeight: '600', 
                  color: todayCount >= maxCount ? '#dc3545' : '#8A2BE2',
                  marginLeft: '4px'
                }}
              >
                {todayCount}
              </span> 
            </div>
          </div>

          <ListGroup style={{ borderRadius: '12px' }}>
            {drafts.length > 0 ? (
              drafts.map((draft, index) => (
                <ListGroup.Item 
                  key={index} 
                  style={{ 
                    borderLeft: 'none', 
                    borderRight: 'none',
                    borderTop: index === 0 ? 'none' : '1px solid rgba(0,0,0,.125)',
                    borderBottom: index === drafts.length - 1 ? 'none' : '1px solid rgba(0,0,0,.125)',
                    padding: '16px',
                    transition: 'all 0.3s ease'
                  }}
                  className="hover-effect"
                >
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div style={{ fontSize: '16px', fontWeight: '500' }}>草稿 #{draft.id}</div>
                    {renderStatus(draft.status)}
                  </div>
                  
                  <div className="draft-detail">
                    <div className="row mt-3">
                      <div className="col-md-6 mb-2">
                        <div className="d-flex align-items-center">
                          <span style={{ fontSize: '14px', color: '#666', width: '80px' }}>草稿ID:</span>
                          <span style={{ fontSize: '14px', color: '#333', fontFamily: 'monospace' }}>{draft.draft_id}</span>
                        </div>
                      </div>
                      <div className="col-md-6 mb-2">
                        <div className="d-flex align-items-center">
                          <ClockHistory style={{ fontSize: '14px', color: '#9370DB', marginRight: '8px' }} />
                          <span style={{ fontSize: '14px', color: '#666' }}>解析时间: </span>
                          <span style={{ fontSize: '14px', color: '#333', fontWeight: '500', marginLeft: '4px' }}>{formatDate(draft.time)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="row mt-1">
                      <div className="col-12 mb-2">
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>{draft.draft_url || '暂无地址'}</Tooltip>}
                        >
                          <div className="d-flex align-items-center">
                            <span style={{ fontSize: '14px', color: '#666', minWidth: '80px' }}>草稿地址:</span>
                            <span 
                              style={{ 
                                fontSize: '14px', 
                                color: draft.draft_url ? '#1890ff' : '#999',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '75%'
                              }}
                            >
                              {draft.draft_url || '暂无'}
                            </span>
                            {draft.draft_url && (
                              <Clipboard 
                                className="ms-2" 
                                style={{ 
                                  color: '#9370DB', 
                                  cursor: 'pointer',
                                  fontSize: '14px'
                                }} 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(draft.draft_url);
                                }}
                              />
                            )}
                          </div>
                        </OverlayTrigger>
                      </div>
                    </div>
                    
                    <div className="row">
                      <div className="col-12">
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>{draft.video_url || '暂无视频地址'}</Tooltip>}
                        >
                          <div className="d-flex align-items-center">
                            <span style={{ fontSize: '14px', color: '#666', minWidth: '80px' }}>视频地址:</span>
                            <span 
                              style={{ 
                                fontSize: '14px', 
                                color: draft.video_url ? '#1890ff' : '#999',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '75%'
                              }}
                            >
                              {draft.video_url || '暂无'}
                            </span>
                            {draft.video_url && (
                              <Clipboard 
                                className="ms-2" 
                                style={{ 
                                  color: '#9370DB', 
                                  cursor: 'pointer',
                                  fontSize: '14px'
                                }} 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(draft.video_url);
                                }}
                              />
                            )}
                          </div>
                        </OverlayTrigger>
                      </div>
                    </div>
                  </div>
                </ListGroup.Item>
              ))
            ) : (
              <ListGroup.Item className="text-center py-4">
                <div style={{ color: '#666' }}>暂无草稿记录</div>
              </ListGroup.Item>
            )}
          </ListGroup>

          {drafts.length > 0 && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              <div className="total-count">
                <CalendarCheckFill className="me-2" style={{ color: '#9370DB' }} />
                <span style={{ color: '#666' }}>总记录数: </span>
                <span style={{ fontWeight: '500', color: '#8A2BE2' }}>{totalCount}</span>
              </div>
              
              <Pagination>
                <Pagination.First 
                  onClick={() => handlePageChange(1)} 
                  disabled={currentPage === 1} 
                />
                <Pagination.Prev 
                  onClick={() => handlePageChange(currentPage - 1)} 
                  disabled={currentPage === 1} 
                />
                {renderPaginationItems()}
                <Pagination.Next 
                  onClick={() => handlePageChange(currentPage + 1)} 
                  disabled={currentPage === totalPages} 
                />
                <Pagination.Last 
                  onClick={() => handlePageChange(totalPages)} 
                  disabled={currentPage === totalPages} 
                />
              </Pagination>
            </div>
          )}
        </Card.Body>
      </Card>
      
      <style jsx>{`
        .hover-effect:hover {
          background-color: rgba(147, 112, 219, 0.03);
          transform: translateY(-2px);
          box-shadow: 0 3px 10px rgba(147, 112, 219, 0.06);
        }
        .pagination .page-item.active .page-link {
          background-color: #9370DB;
          border-color: #9370DB;
        }
        .pagination .page-link {
          color: #8A2BE2;
        }
        .pagination .page-link:focus {
          box-shadow: 0 0 0 0.2rem rgba(147, 112, 219, 0.25);
        }
      `}</style>
    </div>
  );
};

export default DraftList;