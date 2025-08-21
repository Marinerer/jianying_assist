import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { toast } from 'react-toastify';
import { useHistory } from 'react-router-dom';
import { Table, Button, Modal, Form, Row, Col, ButtonGroup } from 'react-bootstrap';
import { Eye, EyeSlash } from 'react-bootstrap-icons';
import ApiService from '../../api/ApiService';
import LocalDataService from '../../api/LocalDataService';

const BotList = () => {
    const [bots, setBots] = useState([]);
    const [cozeToken, setCozeToken] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentBotId, setCurrentBotId] = useState(null);
    const [newBotName, setNewBotName] = useState('');
    const [newBotUrl, setNewBotUrl] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [showCozeToken, setShowCozeToken] = useState(false); // 控制Token显示/隐藏
    const itemsPerPage = 20;

    const api = new ApiService();
    const user = LocalDataService.load_user_data();
    const history = useHistory();
    const userType = 1; // 假设这是一个常量或从用户数据中获取

    useEffect(() => {
        fetchBots(currentPage);
        fetchCozeToken();
    }, [currentPage]);

    const fetchBots = async (page) => {
        try {
            const res = await api.get_user_bot_list(user.token, userType, page, itemsPerPage);
            setBots(res.data || []);
            setTotalItems(res.total_count || 0);
        } catch (error) {
            toast.error("无法加载bot列表");
            console.error(error);
        }
    };

    const fetchCozeToken = async () => {
        try {
            const res = await api.get_user_coze_token(user.token, userType);
            setCozeToken(res.token || '');
            if(res.token == ""){
                setShowCozeToken(true)
            }
        } catch (error) {
            toast.error("无法加载Coze Token");
            console.error(error);
        }
    };

    const handleSaveCozeToken = async () => {
        try {
            await api.update_user_token(user.token, userType, cozeToken);
            toast.success("Coze Token保存成功");
            fetchCozeToken(); // 保存后重新获取以验证保存成功
        } catch (error) {
            toast.error("保存Coze Token失败");
            console.error(error);
        }
    };

    const handleAddBot = async () => {
        if (!newBotName || !newBotUrl) {
            toast.error("Bot名称和Bot URL不能为空");
            return;
        }
        try {
            if (editMode) {
                await api.update_user_bot(user.token, userType, newBotName, newBotUrl, currentBotId);
                toast.success("成功更新bot");
            } else {
                await api.add_user_bot(user.token, userType, newBotName, newBotUrl);
                toast.success("成功添加bot");
            }
            setShowAddModal(false);
            setEditMode(false);
            setNewBotName('');
            setNewBotUrl('');
            setCurrentBotId(null);
            fetchBots(currentPage); // 重新获取bot列表
        } catch (error) {
            toast.error(editMode ? "更新bot失败" : "添加bot失败");
            console.error(error);
        }
    };

    const handleDeleteBot = async (botId) => {
        try {
            await api.del_user_bot(user.token, userType, botId);
            toast.success("成功删除bot");
            fetchBots(currentPage); // 重新获取bot列表
        } catch (error) {
            toast.error("删除bot失败");
            console.error(error);
        }
    };

    const handleEditBot = (bot) => {
        setNewBotName(bot.title);
        setNewBotUrl(bot.bot_url);
        setCurrentBotId(bot.id);
        setEditMode(true);
        setShowAddModal(true);
    };

    const handleToggleStatus = async (botId, currentStatus) => {
        try {
            const newStatus = currentStatus === 1 ? 0 : 1;
            await api.open_bot_status(user.token, userType, botId, newStatus);
            toast.success("成功更新bot状态");
            fetchBots(currentPage); // 重新获取bot列表
        } catch (error) {
            toast.error("更新bot状态失败");
            console.error(error);
        }
    };

    const viewBotDetails = (botId) => {
        history.push(`/botcmdList/${botId}`);
    };

    // 处理部分隐藏Coze Token的显示
    const getMaskedToken = (token) => {
        if (showCozeToken) {
            return token;
        }
        return token.slice(0, 4) + '*'.repeat(token.length);
    };

    return (
        <div className="container mt-4">
            <Form>
                <Form.Label column>Coze Api Token（必填）<a href="https://www.coze.cn/open/oauth/pats" target="_blank" rel="noopener noreferrer">
                    去获取token
                </a></Form.Label>

                <Form.Group as={Row} className="mb-3 align-items-center">
                    <Col sm="10">
                        <Form.Control
                            type="text"
                            placeholder="输入Coze Token"
                            value={getMaskedToken(cozeToken)}
                            onChange={(e) => setCozeToken(e.target.value)}
                            readOnly={!showCozeToken}
                        />
                    </Col>
                    <Col sm="2">
                        <ButtonGroup>
                            <Button variant="secondary" onClick={() => setShowCozeToken(!showCozeToken)}>
                                {showCozeToken ? <EyeSlash /> : <Eye />}
                            </Button>
                            <Button onClick={handleSaveCozeToken}>保存Token</Button>
                        </ButtonGroup>
                    </Col>
                </Form.Group>
            </Form>

            <Button className="btn btn-primary mb-3" onClick={() => {
                setEditMode(false);
                setShowAddModal(true);
                setNewBotName('');
                setNewBotUrl('');
                setCurrentBotId(null);
            }}>
                添加Bot
            </Button>
            <div className="table-responsive">
                {bots.length === 0 ? (
                    <div>
                        <span>还没有bot，赶紧去添加吧</span>
                    </div>
                ) : (
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>名称</th>
                                <th>Bot</th>
                                <th>默认</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bots.map((bot) => (
                                <tr key={bot.id}>
                                    <td>{bot.id}</td>
                                    <td>{bot.title}</td>
                                    <td>{bot.coze_bot_id}</td>
                                    <td>
                                        <Form.Check 
                                            type="switch"
                                            id={`status-switch-${bot.id}`}
                                            checked={bot.status === 1}
                                            onChange={() => handleToggleStatus(bot.id, bot.status)}
                                        />
                                    </td>
                                    <td>
                                        <Button variant="info" onClick={() => viewBotDetails(bot.id)}>
                                            查看命令
                                        </Button>
                                        {' '}
                                        <Button variant="warning" onClick={() => handleEditBot(bot)}>
                                            编辑
                                        </Button>
                                        {' '}
                                        <Button variant="danger" onClick={() => handleDeleteBot(bot.id)}>
                                            删除
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </div>

            {/* 添加/编辑 Bot 模态框 */}
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{editMode ? "编辑Bot" : "添加新的Bot"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form autoComplete="off">
                        <Form.Group>
                            <Form.Label>Bot名称</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="输入Bot名称"
                                value={newBotName}
                                onChange={(e) => setNewBotName(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Bot URL</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows='3'
                                placeholder="输入Bot URL"
                                value={newBotUrl}
                                onChange={(e) => setNewBotUrl(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                        取消
                    </Button>
                    <Button variant="primary" onClick={handleAddBot}>
                        {editMode ? "保存更改" : "添加"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default BotList;