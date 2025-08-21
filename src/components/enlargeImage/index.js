import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import './index.css'

const EnlargeImage = forwardRef((props, ref) => {

  const [imgUrl, setImgUrl] = useState('');
  const [show, setShow] = useState(false);
  useEffect(() => {
    setImgUrl(props.imgUrl)
    return () => {
    };
  }, [props.imgUrl]);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useImperativeHandle(ref, () => ({
    openModal: () => handleShow(),
    closeModal: () => handleClose(),
  }));
  return (
    <>
      <Modal show={show} onHide={handleClose} centered size='lg'>
        <Modal.Header closeButton>
          <Modal.Title>图片详情</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '600px' }}>
          <img src={imgUrl} style={{ maxWidth: '100%', height: 'auto', maxHeight: '100%' }} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            取消
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
});

export default EnlargeImage;
