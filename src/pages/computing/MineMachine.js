import React, { useEffect, useState, useRef } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Offcanvas, Nav, Container, Dropdown, Row, Col, Button } from 'react-bootstrap';
import ApiService from '../../api/ApiService';
import LocalDataService from '../../api/LocalDataService';
import './computing.css'
import { Clipboard2 } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
function MineMachine () {
  const api = new ApiService();
  let user = LocalDataService.load_user_data();
  const [computeList, setComputeList] = useState([]);
  const timerId = useRef(null);
  const timerSlow = useRef(null);
  const clearTimerId = useRef(null);

  useEffect(() => {

    get_compute_combined()

    timerSlow.current = setTimeout(() => {
      get_compute_combined()
    }, 5 * 1000);  // 10 s

    timerId.current = setInterval(() => {
      get_compute_combined()
    }, 10 * 1000);

    clearTimerId.current = setTimeout(() => {
      clearInterval(timerId.current);
    }, 2 * 60 * 1000);  // 10 minutes

    return () => {
      if (timerId.current) {
        clearInterval(timerId.current);
      }
      if (clearTimerId.current) {
        clearTimeout(clearTimerId.current);
      }
      if (timerSlow.current) {
        clearTimeout(timerSlow.current);
      }
    };
  }, []);


  const get_compute_combined = async (item) => {
    const res = await api.get_compute_combined(user.token)
    if (res) {
      res.forEach((item) => {
        item.created_at = item.created_at.replace('T', ' ')
        if (item.stopped_at) {
          item.stopped_at = item.stopped_at.replace('T', ' ')
        }
      })
      setComputeList(res)
    }
  }

  const closeCompute = async (item) => {
    const res = await api.close_compute_combined(user.token, item.deployment_uuid)
    if (res.code == 'Success') {
      toast('关机成功')
    }
  }

  // 计算运行时间和预计费用
  const calculateTimeAndCost = (startTime, stopped_at, status) => {
    const start = new Date(startTime);
    let stop = 0
    const now = new Date();
    let diffInMs = 0
    if (status == 'running') {
      diffInMs = now - start;
    }
    if (status == 'stop' && stopped_at) {
      stop = new Date(stopped_at);
      diffInMs = stop - start;
    }
    const diffInHours = diffInMs / (1000 * 60 * 60);

    return diffInHours.toFixed(2)
  }
  // 处理 SSH 命令的显示
  const formatSshCommand = (command) => {
    return command.substring(0, 3) + '******';
  }

  // 处理密码的显示
  const formatPassword = () => {
    return '*********';
  }

  const copyPrompt = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast('复制成功')
    } catch (error) {
      console.error('复制内容时出现错误:', error);
    }
  }

  return (
    <div className='MineMachine'>
      <div className="scrollable-table-container">
        <table className="table" style={{ minWidth: '1400px' }}>
          <thead>
            <tr>
              <th>订单号</th>
              <th>状态</th>
              <th>订单型号</th>
              <th>单价（元）</th>
              <th>开启时间</th>
              <th>运行时间（小时）</th>
              {/* <th>预计费用（元）</th> */}
              <th>SSH</th>
              <th>服务地址</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {computeList.map((item, index) => (
              <tr key={index}>
                <td>
                  {item.uuid}
                </td>
                <td style={{ width: '100px' }}>
                  {
                    item.status === 'running' ? (
                      <span style={{ color: '#1ad100' }}>开启中</span>
                    ) : item.status === 'stop' ? (
                      <span style={{ color: '#999999' }}>已关机</span>
                    ) : (
                      <span style={{ color: '#3760f4' }}>部署中</span>
                    )
                  }
                </td>
                <td style={{ width: '100px' }}>
                  {item.gpu_name}
                </td>
                <td style={{ width: '110px' }}>
                  {(item.price / 1000).toFixed(2)}
                </td>
                <td style={{ width: '100px' }}>
                  {item.created_at}
                </td>
                <td style={{ width: '170px' }}>
                  {calculateTimeAndCost(item.created_at, item.stopped_at, item.status)}
                </td>
                {/* <td style={{ width: '170px' }}>
                  {(calculateTimeAndCost(item.created_at) * (item.price / 1000)).toFixed(2)}
                </td> */}

                <td style={{ width: '120px' }}>
                  <div className='ssh-account'> 登陆指令：<br />{formatSshCommand(item.ssh_command)}<Clipboard2 style={{ transform: 'translateY(-2px)', color: '#3760f4', cursor: 'pointer' }} size={18} className='me-2' onClick={(e) => copyPrompt(item.ssh_command)} /></div>
                  <div className='ssh-password'> 密码：<br />{formatPassword()}<Clipboard2 style={{ transform: 'translateY(-2px)', color: '#3760f4', cursor: 'pointer' }} size={18} className='me-2' onClick={(e) => copyPrompt(item.root_password)} /></div>
                </td>
                <td>
                  <a
                    className='text-primary'
                    target="_blank"
                    style={{ cursor: 'pointer', marginLeft: '10px' }}
                    href={item.service_url}
                  >{item.service_url}</a>
                </td>
                <td style={{ width: '100px' }}>
                  <button className="btn btn-sm btn-danger " disabled={item.status == 'stop'} variant="danger" onClick={() => closeCompute(item)} >关机</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MineMachine;
