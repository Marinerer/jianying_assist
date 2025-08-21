import React, { useEffect, useState, forwardRef } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Form, Nav, Container, Dropdown, Row, Col, Button, Toast } from 'react-bootstrap';
import ApiService from '../../api/ApiService';
import LocalDataService from '../../api/LocalDataService';
import './computing.css'
import { House, Display, HddStack } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';

const Market = forwardRef((props, ref) => {
  const api = new ApiService();
  let user = LocalDataService.load_user_data();
  const [regionList, setRegionList] = useState([]);
  const [regionStockIndex, setRegionStockIndex] = useState(0);
  const [regionStockList, setRegionStockList] = useState([]);
  const [mirrorMarketList, setMirrorMarketList] = useState([]);
  const [mirrorMarketId, setMirrorMarketId] = useState(0);
  const [mirrorMarketIndex, setMirrorMarketIndex] = useState(0);
  const [tabIndex, setTabIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [totalMoney, setTotalMoney] = useState(0);

  useEffect(() => {
    get_user_money()
    get_compute_region()
    get_docker_images_list()
  }, []);

  const get_user_money = async () => {
    let res = await api.get_user_money(user.token);
    if (res) {
      setTotalMoney(res.total_money)
    }
  }
  const get_docker_images_list = async () => {
    let res = await api.get_docker_images_list(user.token, currentPage, pageSize);
    if (res) {
      setMirrorMarketList(res.docker_images)
      setMirrorMarketIndex(mirrorMarketIndex)
      if (props.dockerIndex) {

        setMirrorMarketId(res.docker_images[props.dockerIndex].image_uuid)
      } else {
        setMirrorMarketId(res.docker_images[0].image_uuid)
      }
    }
  }

  const get_compute_region = async () => {
    const res = await api.get_compute_region(user.token)
    if (res) {
      setRegionList(res)
      get_compute_region_stock(res[tabIndex].region_sign)
    }
  }
  const get_compute_region_stock = async (region_sign) => {
    console.log(region_sign, 'region_sign');
    const res = await api.get_compute_region_stock(user.token, region_sign)
    if (res) {
      setRegionStockList(res.data)
    }
  }

  const changeTab = (index) => {
    setTabIndex(index)
    setRegionStockIndex(0)
    get_compute_region_stock(regionList[index].region_sign)
  }

  const createMarket = async () => {
    if (totalMoney <= 50) {
      toast.error('余额不足，请前往充值')
    }
    console.log();
    const token = user.token
    const region_sign = regionList[tabIndex].region_sign
    const gpu_name = Object.keys(regionStockList[regionStockIndex])[0];
    console.log(mirrorMarketIndex, 'mirrorMarketIndex');
    const image_uuid = mirrorMarketId
    const res = await api.create_compute_deployment(token, region_sign, gpu_name, image_uuid)
    if (res.code == 'Success') {
      props.updateMenu('MineMachine')
    }
  }
  const changeMirrorMarket = (e, index) => {
    setMirrorMarketId(e.target.value)
    setMirrorMarketIndex(index)
  }
  const amountNum = (item) => {
    console.log(item,'item');
    if (item == 'RTX 4090') {
      return '2.5~2.8'
    } else if (item == 'RTX 3090') {
      return '1.4~1.8'
    } else if (item == 'RTX A5000') {
      return '1.2~1.4'
    } else {
      return '--'
    }
  }
  return (
    <div className='Market'>
      <div className='Market-top'>
        <div className='Market-top-info'>
          <div className='Market-title'>选择地区：</div>
          <div className='Market-tab'>
            {
              regionList.map((item, index) => (
                <div className={`Market-tab-info ${index == tabIndex ? 'Market-tab-info-active' : ''}`} key={index} onClick={() => changeTab(index)}>
                  {item.title}
                </div>
              ))
            }
          </div>
        </div>
        <div className='Market-top-info'>
          <div className='Market-title'>选择镜像：</div>
          <Form.Group>
            <Form.Select value={mirrorMarketId} onChange={(e) => changeMirrorMarket(e)}>
              {mirrorMarketList.map((model, i) => (
                <option value={model.image_uuid} key={i}>{model.title}</option>
              ))
              }
            </Form.Select>
          </Form.Group>
        </div>
      </div>
      <div className='Market-content-title'>选择机器：</div>
      <div className='Market-content'>
        {
          regionStockList.map((item, index) => (

            <div className={`Market-info ${regionStockIndex == index ? 'Market-info-active' : ''}`} key={index} onClick={() => setRegionStockIndex(index)}>
              <div className='Market-info-top'>
                <img className='Market-info-top-bg' src='https://video-img.fyshark.com/170433867151410001.png'></img>
                <div className='Market-name'>{Object.keys(item)}</div>
                <div className='Market-amount'>
                  {amountNum(Object.keys(item)[0])}/时
                </div>
                <div className='Market-num'>数量：{item[Object.keys(item)].idle_gpu_num}/{item[Object.keys(item)].total_gpu_num}</div>

              </div>
              <div className='Market-info-bottom'>

              </div>
            </div>
          ))
        }
      </div>
      <div className='Market-bottom'>
        <Button className='Market-button' onClick={() => createMarket()}>创建部署</Button>
      </div>
    </div>
  );
})

export default Market;
