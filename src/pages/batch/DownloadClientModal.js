import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const DownloadClientModal = ({ show, handleClose, downloadUrl }) => {

    const handleDownload = () => {
        window.open(downloadUrl, '_blank');
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>下载客户端</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <p>导出剪映涉及到音频和图片下载</p>
                <p>点击下方按钮下载客户端软件使用。</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={handleDownload}>
                    下载客户端
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DownloadClientModal;