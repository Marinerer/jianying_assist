import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { Download, Search, Star, StarFill, Grid3x3, SortDown } from 'react-bootstrap-icons';
import './templateList.css';

const TemplateList = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [hoveredCard, setHoveredCard] = useState(null);

  // 模拟的分类数据
  const categories = [
    { id: 'all', name: '全部' },
    { id: 'vlog', name: 'Vlog' },
    { id: 'short', name: '短视频' },
    { id: 'travel', name: '旅行' },
    { id: 'food', name: '美食' },
    { id: 'business', name: '商务' }
  ];

  useEffect(() => {
    loadTemplates();
  }, [selectedCategory, sortBy]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      // 模拟延迟加载
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // 模拟从API获取模板列表
      const mockTemplates = [
        {
          id: 1,
          name: '旅行Vlog模板',
          description: '适合旅行记录的精美模板',
          thumbnail: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
          category: 'travel',
          downloads: 3254,
          rating: 4.8,
          tags: ['旅行', 'Vlog']
        },
        {
          id: 2,
          name: '美食探店模板',
          description: '展示美食的精致模板',
          thumbnail: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
          category: 'food',
          downloads: 2187,
          rating: 4.6,
          tags: ['美食', '探店']
        },
        {
          id: 3,
          name: '商业宣传模板',
          description: '专业的产品展示模板',
          thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
          category: 'business',
          downloads: 1893,
          rating: 4.7,
          tags: ['商业', '产品']
        },
        {
          id: 4,
          name: '短视频特效包',
          description: '流行短视频转场和特效',
          thumbnail: 'https://images.unsplash.com/photo-1626379953822-baec19c3accd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
          category: 'short',
          downloads: 5421,
          rating: 4.9,
          tags: ['短视频', '特效']
        },
        {
          id: 5,
          name: 'Vlog日常记录',
          description: '清新日常生活记录模板',
          thumbnail: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
          category: 'vlog',
          downloads: 2865,
          rating: 4.5,
          tags: ['日常', 'Vlog']
        },
        {
          id: 6,
          name: '城市风光模板',
          description: '城市建筑景观展示',
          thumbnail: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
          category: 'travel',
          downloads: 1756,
          rating: 4.4,
          tags: ['城市', '风光']
        }
      ];
      
      // 根据所选分类过滤
      let filteredTemplates = selectedCategory === 'all' 
        ? mockTemplates 
        : mockTemplates.filter(t => t.category === selectedCategory);
      
      // 根据搜索词过滤
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredTemplates = filteredTemplates.filter(
          t => t.name.toLowerCase().includes(term) || 
               t.description.toLowerCase().includes(term) ||
               t.tags.some(tag => tag.toLowerCase().includes(term))
        );
      }
      
      // 排序
      if (sortBy === 'popular') {
        filteredTemplates.sort((a, b) => b.downloads - a.downloads);
      } else if (sortBy === 'rating') {
        filteredTemplates.sort((a, b) => b.rating - a.rating);
      } else if (sortBy === 'newest') {
        // 在实际应用中这里会按照创建日期排序
        filteredTemplates.reverse();
      }
      
      setTemplates(filteredTemplates);
    } catch (error) {
      toast.error('加载模板列表失败');
      console.error('加载模板失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    // 当搜索词变化时，延迟500ms执行搜索，避免频繁请求
    const delayDebounce = setTimeout(() => {
      loadTemplates();
    }, 500);
    
    return () => clearTimeout(delayDebounce);
  };

  const handleDownload = async (template) => {
    try {
      // 模拟下载过程
      toast.info(`正在准备下载"${template.name}"...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`"${template.name}"下载成功！`);
    } catch (error) {
      toast.error('下载模板失败');
      console.error('下载失败:', error);
    }
  };

  // 格式化下载数量显示
  const formatDownloads = (num) => {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + 'w';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num;
  };

  // 渲染评分星星
  const renderRating = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    
    return (
      <div className="template-rating">
        {[...Array(5)].map((_, i) => (
          <span key={i} className="star-icon">
            {i < fullStars ? 
              <StarFill size={14} style={{ color: '#FFD700' }} /> : 
              (i === fullStars && hasHalfStar ? 
                <StarFill size={14} style={{ color: '#FFD700', opacity: 0.6 }} /> : 
                <Star size={14} style={{ color: '#BBB' }} />)
            }
          </span>
        ))}
        <span className="rating-number">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <Container fluid className="template-list-container py-4">
      {/* 顶部搜索和过滤区域 */}
      <div className="template-controls mb-4">
        <div className="search-container">
          <div className="search-input-wrapper">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="搜索模板..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
        </div>
        
        <div className="filter-sort-container">
          <div className="categories-wrapper">
            <Grid3x3 className="category-icon" />
            <div className="categories-list">
              {categories.map(category => (
                <button
                  key={category.id}
                  className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
          
          <div className="sort-options">
            <SortDown className="sort-icon" />
            <select 
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="popular">热门程度</option>
              <option value="rating">好评优先</option>
              <option value="newest">最新发布</option>
            </select>
          </div>
        </div>
      </div>

      {/* 模板卡片展示区域 */}
      {loading ? (
        <div className="loading-container">
          <Spinner 
            animation="border" 
            variant="primary" 
            style={{ 
              color: '#8A2BE2',
              width: '3rem', 
              height: '3rem'
            }} 
          />
          <p className="loading-text">加载模板中...</p>
        </div>
      ) : templates.length === 0 ? (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <h4>未找到相关模板</h4>
          <p>尝试使用其他关键词搜索或清除筛选条件</p>
        </div>
      ) : (
        <Row className="template-row">
          {templates.map((template) => (
            <Col 
              key={template.id} 
              xs={12} sm={6} md={4} lg={3} 
              className="mb-4 template-col"
            >
              <Card 
                className={`template-card ${hoveredCard === template.id ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredCard(template.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="card-img-container">
                  <Card.Img variant="top" src={template.thumbnail} className="template-thumbnail" />
                  <div className="template-tags">
                    {template.tags.map((tag, index) => (
                      <span key={index} className="template-tag">{tag}</span>
                    ))}
                  </div>
                </div>
                <Card.Body className="template-card-body">
                  <div className="template-info">
                    <Card.Title className="template-title">{template.name}</Card.Title>
                    <Card.Text className="template-description">{template.description}</Card.Text>
                    <div className="template-stats">
                      {renderRating(template.rating)}
                      <span className="template-downloads">
                        <Download size={14} className="download-icon" />
                        {formatDownloads(template.downloads)}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    className="download-btn"
                    onClick={() => handleDownload(template)}
                  >
                    <Download size={16} className="me-1" />
                    下载模板
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default TemplateList;
