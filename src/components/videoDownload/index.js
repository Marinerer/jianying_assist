import React, { useState, forwardRef } from 'react';
import { ButtonGroup, Button, Row, Col, Spinner, Form } from 'react-bootstrap';
import ApiService from '../../api/ApiService';
import LocalDataService from '../../api/LocalDataService';
import { toast } from 'react-toastify';

const VideoDown = forwardRef((props, ref) => {
  const [searchVideoUrl, setSearchVideoUrl] = useState('');
  const [videoUrlList, setVideoUrlList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchVideo = async () => {
    setIsLoading(true);
    const text = searchVideoUrl;
    const regex = /(https?:\/\/[^\s]+)/;
    const match = text.match(regex);
    const firstLink = match ? match[0] : "";
    let user = LocalDataService.load_user_data();
    const api = new ApiService();
    let json = await api.down_load_video(user.token, firstLink);
    setIsLoading(false);
    if (json.status) {
      toast.error('搜索失败，链接错误，请重新输入');
    } else {
      let videoUrlList = json.medias.filter(item => item.type === 'video' || item.extension === 'mp4' || item.extension === 'mp3');
      setVideoUrlList(videoUrlList);
    }
  }

  const getBtnTitle = (quality) => {
    const titles = {
      'hd_no_watermark': '高清无水印',
      'no_watermark': '无水印',
      'watermark': '水印',
      'audio': '音频'
    };
    return titles[quality] || quality;
  }

  return (
    <div >
      <div >
        <div className='mt-3'>
          
            <Form>
              <Form.Group controlId="searchVideoUrl">
                <Form.Control
                  as="textarea"
                  rows={5}
                  placeholder="请输入抖音分享链接，可以无水印下载"
                  value={searchVideoUrl}
                  onChange={(e) => setSearchVideoUrl(e.target.value)}
                />
              </Form.Group>
              
                <Button 
                className='mt-3'
                  variant="primary" 
                  style={{width:'100%'}}
                  disabled={isLoading} 
                  onClick={searchVideo}
                >
                  {isLoading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                      />
                      <span className="sr-only">Loading...</span>
                    </>
                  ) : (
                    '点击搜索视频'
                  )}
                </Button>
              
            </Form>
          
        </div>
        {videoUrlList.length > 0 &&
          <div className="list-group-item" >
            <Col>请选择视频：</Col>
            <Col>
              <div className="d-flex flex-wrap">
                {videoUrlList.map((item, index) => (
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    key={index}
                    className="m-2"
                  >
                    <Button variant="info">下载{getBtnTitle(item.quality)}</Button>
                  </a>
                ))}
              </div>
            </Col>
          </div>
        }
      </div>
    </div>
  );
});

export default VideoDown;
