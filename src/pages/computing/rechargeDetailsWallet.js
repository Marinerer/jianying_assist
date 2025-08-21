import React, { useEffect, useState, useRef } from 'react';
import { } from 'react-router-dom';
import { Button, Pagination } from 'react-bootstrap';
import ApiService from '../../api/ApiService';
import LocalDataService from '../../api/LocalDataService';
import { toast } from 'react-toastify';
import './computing.css'
function RechargeDetails ({ setTotalCount }) {
  const api = new ApiService();
  let user = LocalDataService.load_user_data();
  const [shopList, setShopList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    get_user_money_detail()
    return () => {
    };
  }, [currentPage]);

  const get_user_money_detail = async () => {
    let res = await api.get_my_promote_user(user.token,1, currentPage, pageSize);
    if (res) {
      res.data.forEach((item, indes) => {
        item.time = item.time.replace('T', ' ')
      })
      setTotalPages(Math.ceil(res.total_count / pageSize))
      setShopList(res.data)
      setTotalCount(res.total_count); 
    }
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  }
  


  return (
    <div className="">
      <div className="scrollable-table-container">

        <table className="table" >
          <thead>
            <tr>
              <th>用户</th>
              <th>手机号</th>
              <th>vip等级</th>
              <th>时间</th>
            </tr>
          </thead>
          <tbody>
            {shopList.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.phone}</td>
                <td>
                  {item.vip_level==0?
                  <text >普通用户</text>:
                  <text style={{color:'rgb(255 68 68)'}}>VIP用户</text>}
                </td>
                <td>{item.time}</td>
              
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="container pagination table-pagination">
        <Pagination>
          <Pagination.First onClick={() => handlePageChange(1)} />
          <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} />
          {currentPage > 2 && <Pagination.Ellipsis />}
          {currentPage > 1 && <Pagination.Item onClick={() => handlePageChange(currentPage - 1)}>{currentPage - 1}</Pagination.Item>}
          <Pagination.Item active>{currentPage}</Pagination.Item>
          {currentPage < totalPages && <Pagination.Item onClick={() => handlePageChange(currentPage + 1)}>{currentPage + 1}</Pagination.Item>}
          {currentPage < totalPages - 1 && <Pagination.Ellipsis />}
          <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} />
          <Pagination.Last onClick={() => handlePageChange(totalPages)} />
        </Pagination>
      </div>
    </div>
  );
}

export default RechargeDetails;
