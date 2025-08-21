import React from 'react';
import { useHistory } from 'react-router-dom';
import { ListGroup, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faUser, faCog, faBell, faFileContract, faFileAlt } from '@fortawesome/free-solid-svg-icons';


const SettingList = ({  }) => {

    const history = useHistory();

  const items = [
    { id: 4, icon: faFileContract, text: '服务条款',path :'/fuwu' },
    { id: 5, icon: faFileAlt, text: '隐私协议' ,path : '/yinsi'},
    // 可以根据需要添加更多的列表项
  ];
  const onItemSelect = (item)=>{
    history.push(item.path);
  }

  

  return (
    <ListGroup className='mt-3'>
      {items.map(item => (
        <ListGroup.Item key={item.id} action onClick={() => onItemSelect(item)}>
          <Row>
            <Col xs={2}>
              <FontAwesomeIcon icon={item.icon} />
            </Col>
            <Col>
              {item.text}
            </Col>
            <Col xs={2} className="text-right">
              <FontAwesomeIcon icon={faArrowRight} />
            </Col>
          </Row>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
};

export default SettingList;
