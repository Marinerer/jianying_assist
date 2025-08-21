import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import {  } from 'react-bootstrap';
import ApiService from '../../api/ApiService';
import LocalDataService from '../../api/LocalDataService';
import { toast } from 'react-toastify';
import './index.css'

const MirrorMarket = forwardRef(({updateMenu}, ref) => {

  const api = new ApiService();
  let user = LocalDataService.load_user_data();
  const [mirrorMarketList, setMirrorMarketList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);

  useEffect(() => {
    get_docker_images_list()
    return () => {

    };
  }, []);

  const get_docker_images_list = async () => {
    let res = await api.get_docker_images_list(user.token, currentPage, pageSize);
    if (res) {
      setMirrorMarketList(res.docker_images)
    }
  }

  return (
    <div className='mirro-market'>
      {
        mirrorMarketList.map((item, index) => (

          <div className='market-imfo' key={index}>
            <div className='market-info-top'>
              <div className='market-info-content'>
                <div className='market-info-content-info'>
                  <div className='market-info-title'>{item.title}</div>
                  <div className='market-info-tips'>{item.sub_title}</div>
                </div>
              </div>
            </div>
            <div className='market-info-buttom' onClick={() => updateMenu('Market',index)}>
              {'前往部署 >>>'}
            </div>
          </div>
        ))
      }
    </div>
  );
});

export default MirrorMarket;
