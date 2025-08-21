import React, { useEffect, useState, useRef } from 'react';
import { } from 'react-router-dom';
import { Button, Pagination } from 'react-bootstrap';
import ApiService from '../../api/ApiService';
import LocalDataService from '../../api/LocalDataService';
import { toast } from 'react-toastify';
import './computing.css'
function RechargeDetails () {
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
    let res = await api.get_user_money_detail(user.token, currentPage, pageSize);
    if (res) {
      res.money_detail.forEach((item, indes) => {
        item.time = item.time.replace('T', ' ')
      })
      setTotalPages(Math.ceil(res.total_count / pageSize))
      setShopList(res.money_detail)
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
              <th style={{ width: '100px' }}>标题</th>
              <th>获取佣金（元）</th>
              <th>时间</th>
            </tr>
          </thead>
          <tbody>
            {shopList.map((item) => (
              <tr key={item.id}>
                <td>{item.title}</td>
                <td>{item.money/100}</td>
                <td>{item.time}</td>
              
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="container pagination table-pagination">
        {/* ... other code */}
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
        {/* ... other code */}
      </div>
    </div>
  );
}

export default RechargeDetails;
