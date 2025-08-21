import React, { useState } from 'react';
import { Button, Form, Container, Row, Col, Table } from 'react-bootstrap';
import ApiService from '../../api/ApiService';
import LocalDataService from '../../api/LocalDataService';
import { toast } from 'react-toastify';
import { useHistory } from 'react-router-dom';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

const CreateCollection = () => {
    const [title, setTitle] = useState('');
    const [preValue, setPreValue] = useState('');
    const [inputList, setInputList] = useState(['这是一个测试文本']);
    const [bulkInput, setBulkInput] = useState('');
    const [file, setFile] = useState(null);
    const [showPrefix, setShowPrefix] = useState(false);
    const [showBulkInput, setShowBulkInput] = useState(false);
    const [showFileInput, setShowFileInput] = useState(false);

    const api = new ApiService();
    let user = LocalDataService.load_user_data();
    let history = useHistory();

    const handleInputChange = (e, index) => {
        const { value } = e.target;
        const list = [...inputList];
        list[index] = value;
        setInputList(list);
    };

    const handleRemoveClick = (index) => {
        const list = [...inputList];
        list.splice(index, 1);
        setInputList(list);
    };

    const handleAddClick = () => {
        setInputList([...inputList, '']);
    };

    const handleBulkInputChange = (e) => {
        const { value } = e.target;
        setBulkInput(value);
    };

    const handleBulkInputSubmit = () => {
        const list = bulkInput.split('\n').map(item => item.trim()).filter(item => item !== '');
        setInputList([...inputList, ...list]);
        setBulkInput('');
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleFileSubmit = () => {
        if (!file) {
            toast.error('请选择一个Excel或CSV文件');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const fileExtension = file.name.split('.').pop().toLowerCase();
            if (fileExtension === 'xlsx' || fileExtension === 'xls') {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
                const list = rows.flat().map(item => item.toString().trim()).filter(item => item !== '');
                setInputList([...inputList, ...list]);
            } else if (fileExtension === 'csv') {
                const csvData = event.target.result;
                Papa.parse(csvData, {
                    complete: (results) => {
                        const list = results.data.flat().map(item => item.toString().trim()).filter(item => item !== '');
                        setInputList([...inputList, ...list]);
                    }
                });
            } else {
                toast.error('仅支持Excel或CSV文件');
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const input_list = inputList.map(value => ({ value: preValue + value }));

        try {
            const response = await api.create_batch_collection(user.token, title, input_list);
            if (response.id > 0) {
                toast.success('创建完成');
                // history.push(`/batchList`);
                history.push(`/batchdetails/${response.collection_id}`);
            } else {
                toast.error('创建失败，请重试');
            }
        } catch (error) {
            toast.error('创建集合时出错');
            console.error(error);
        }
    };

    return (
        <Container>
            <Row className="justify-content-md-center">
                <Col md="8">
                    <h3 className="mt-4">新增笔记</h3>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="formTitle">
                            <Form.Label>标题</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Button variant="link" onClick={() => setShowPrefix(!showPrefix)}>
                            {showPrefix ? '隐藏固定前缀' : '增加固定前缀'}
                        </Button>
                        {showPrefix && (
                            <Form.Group controlId="formPrefix">
                                <Form.Label>固定前缀（自动拼接到每行内容）</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="输入前缀"
                                    value={preValue}
                                    onChange={(e) => setPreValue(e.target.value)}
                                />
                            </Form.Group>
                        )}

                        <Button variant="link" onClick={() => setShowBulkInput(!showBulkInput)}>
                            {showBulkInput ? '隐藏批量内容输入' : '批量文本导入'}
                        </Button>
                        {showBulkInput && (
                            <Form.Group controlId="formBulkInput">
                                <Form.Label>批量内容（每行一个条目）</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="输入批量内容，使用换行符分隔"
                                    value={bulkInput}
                                    onChange={handleBulkInputChange}
                                />
                                <Button variant="primary" onClick={handleBulkInputSubmit} className="mt-2">
                                    添加批量内容
                                </Button>
                            </Form.Group>
                        )}

                        <Button variant="link" onClick={() => setShowFileInput(!showFileInput)}>
                            {showFileInput ? '隐藏文件输入' : '表格快速导入'}
                        </Button>
                        {showFileInput && (
                            <Form.Group controlId="formFileInput">
                                <Form.Label>Excel/CSV 文件输入</Form.Label>
                                <Form.Control
                                    type="file"
                                    accept=".xlsx, .xls, .csv"
                                    onChange={handleFileChange}
                                />
                                <Button variant="primary" onClick={handleFileSubmit} className="mt-2">
                                    添加文件内容
                                </Button>
                            </Form.Group>
                        )}

                        
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>需要批处理的内容</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inputList.map((x, i) => (
                                    <tr key={i}>
                                        <td>{i + 1}</td>
                                        <td>
                                            <Form.Control
                                                type="text"
                                                as="textarea"
                                                placeholder="输入内容"
                                                value={x}
                                                onChange={(e) => handleInputChange(e, i)}
                                                required
                                            />
                                        </td>
                                        <td>
                                            <Button variant="danger" onClick={() => handleRemoveClick(i)}>
                                                删除
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        <Button variant="primary" onClick={handleAddClick} className="mb-3">
                            添加一行
                        </Button>
                        <Row>
                            <Button variant="success" type="submit" className="mt-3">
                                提交
                            </Button>
                        </Row>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default CreateCollection;
