// SetJianyinPathModal.js
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import LocalDataService from '../../api/LocalDataService';

let ipcRenderer;
if (typeof window !== 'undefined' && window.require) {
  ipcRenderer = window.require('electron').ipcRenderer;
}

const SetJianyinPathModal = ({ show, handleClose }) => {
  const [path, setPath] = useState('');


  useEffect(() => {
    let jian_path = LocalDataService.getDraftPath();
    setPath(jian_path);

  }, []);


  const handleChoosePath = async () => {
    try {
      const result = await ipcRenderer.invoke('open-directory-dialog');
      if (result.filePaths && result.filePaths[0]) {
        setPath(result.filePaths[0]);
      }
    } catch (error) {
      console.error('Error selecting directory', error);
    }
  };

  const handleSave = () => {
    if (path) {
      LocalDataService.setDraftPath(path);
      handleClose();
    }
  };

  const toOfficial = () => {
    ipcRenderer.invoke('open-url', 'https://krxc4izye0.feishu.cn/wiki/LZ57waPeYiWqVjktI08crZbYnxb');
  }

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>设置剪映路径</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className='jianyin-path-tips' onClick={toOfficial}>👉 如何配置剪映路径？</div>
        <Form>
          <Form.Group controlId="formPath">
            <Form.Label>剪映路径</Form.Label>
            <div className="d-flex">
              <Form.Control
                type="text"
                placeholder="请选择剪映路径"
                value={path}
                readOnly
              />
              <Button variant="success" onClick={handleChoosePath} className="ml-2">
                选择
              </Button>
            </div>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          取消
        </Button>
        <Button variant="primary" onClick={handleSave}>
          保存路径
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SetJianyinPathModal;