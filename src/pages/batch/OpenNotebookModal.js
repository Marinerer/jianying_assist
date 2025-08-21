import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import LocalDataService from '../../api/LocalDataService';

const OpenNotebookModal = ({ show, handleClose,ipcRenderer }) => {
  const [url, setUrl] = useState('');

  let history = useHistory();

  const handleChange = (e) => {
    setUrl(e.target.value);
  };

  const handleOpen = () => {
    let data = {
      // url: url,
      url: "https://video-snot-12220.oss-cn-shanghai.aliyuncs.com/draft/06100559-dc95-4f2c-a3a8-c1a08553d4f0.json",
      destPath: LocalDataService.getDraftPath()
    }
    ipcRenderer.invoke('download-json-and-resources', data)

    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>请输入草稿id</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group controlId="formUrl">
          {/* <Form.Label>草稿</Form.Label> */}
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="输入草稿ID"
            value={url}
            onChange={handleChange}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleOpen}>
          确定
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default OpenNotebookModal;