// ExportJianyinModal.js
import React, { useState } from 'react';
import { Modal, Button, Form, Image } from 'react-bootstrap';

const ExportJianyinModal = ({ show, handleClose, handleExport }) => {
    const [selectedOption, setSelectedOption] = useState('option1');

    const handleChange = (e) => {
        setSelectedOption(e.target.value);
    };

    const handleConfirm = () => {
        handleExport(selectedOption);
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>导出剪映模版</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group>
                        <Form.Label>选择导出选项</Form.Label>
                        <Form.Check 
                            type="radio" 
                            label="鸡汤草稿" 
                            name="exportOptions" 
                            value="option1" 
                            checked={selectedOption === 'option1'} 
                            onChange={handleChange} 
                        />
                        <Form.Check 
                            type="radio" 
                            label="动漫草稿" 
                            name="exportOptions" 
                            value="option2" 
                            checked={selectedOption === 'option2'} 
                            onChange={handleChange} 
                        />
                        <Form.Check 
                            type="radio" 
                            label="视频草稿" 
                            name="exportOptions" 
                            value="option3" 
                            checked={selectedOption === 'option3'} 
                            onChange={handleChange} 
                        />
                    </Form.Group>
                    {/* <Image src="path/to/preview_image.jpg" fluid />  */}
                    {/* <p>相关描述文字</p> */}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    取消
                </Button>
                <Button variant="primary" onClick={handleConfirm}>
                    确认
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ExportJianyinModal;