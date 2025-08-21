import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import { Table, Button, Modal, Form, Spinner } from 'react-bootstrap';
import ApiService from '../../api/ApiService';
import LocalDataService from '../../api/LocalDataService';
import { sendMessage } from './cozeAPI';

const BotCmdList = () => {
    const { botId } = useParams(); // 从路由获取 botId 参数
    const [cmds, setCmds] = useState([]);
    const [loading, setLoading] = useState(false); // 全局加载状态
    const [showAddModal, setShowAddModal] = useState(false);
    const [showTestModal, setShowTestModal] = useState(false);
    const [selectedCmd, setSelectedCmd] = useState(null); // 被选中的命令用于测试
    const [collectionId, setCollectionId] = useState(''); // 用户输入的collection_id
    const [newCmdTitle, setNewCmdTitle] = useState('');
    const [newCmd, setNewCmd] = useState('');
    const [sendCmd ,setSendCmd ] = useState('hello');

    const api = new ApiService();
    const user = LocalDataService.load_user_data();
    const userType = 1; // 假设这是一个常量或从用户数据中获取

    useEffect(() => {
        fetchCmds(botId);
    }, [botId]);

    useEffect(() => {
        if (collectionId && selectedCmd) {
            setSendCmd(`调用 ${selectedCmd.cmd}, collection_id: ${collectionId}`)
            
        }
    }, [collectionId]);

    const fetchCmds = async (botId) => {
        try {
            const res = await api.get_bot_cmds(user.token, userType, botId);
            setCmds(res.data || []);
        } catch (error) {
            toast.error("无法加载命令列表");
            console.error(error);
        }
    };

    const handleAddCmd = async () => {
        if (!newCmdTitle || !newCmd) {
            toast.error("命令标题和内容不能为空");
            return;
        }
        try {
            await api.add_bot_cmd(user.token, userType, newCmdTitle, newCmd, botId);
            toast.success("成功添加命令");
            setShowAddModal(false);
            setNewCmdTitle('');
            setNewCmd('');
            fetchCmds(botId); // 重新获取命令列表
        } catch (error) {
            toast.error("添加命令失败");
            console.error(error);
        }
    };

    const handleDeleteCmd = async (cmdId) => {
        try {
            await api.del_bot_cmd(user.token, userType, cmdId);
            toast.success("成功删除命令");
            fetchCmds(botId); // 重新获取命令列表
        } catch (error) {
            toast.error("删除命令失败");
            console.error(error);
        }
    };

    const handleTestCmd = async () => {
        if (!collectionId) {
            toast.error("请输入笔记ID");
            return;
        }
        setLoading(true);
        try {
            let token_data = await api.get_user_coze_token(user.token, userType);
            let coze_token = token_data?.token || "";
            let bot_data = await api.get_user_bot_by_id(user.token, userType, selectedCmd.bot_id);
            let coze_bot_id = bot_data?.coze_bot_id || "";

            let res = await sendMessage(new Date().getTime() + '', coze_bot_id, collectionId, sendCmd, coze_token);
            if (res.code === 0) {

                let msg = ""
                for(let res_msg of res.messages){
                    if( res_msg.type == 'answer'){
                        msg = res_msg.content
                    }
                }

                toast.success("命令发送成功: " + msg);
            } else {
                toast.error(res.msg);
            }
        } catch (error) {
            toast.error("命令发送失败");
            console.error(error);
        } finally {
            setLoading(false);
            setShowTestModal(false);
            setCollectionId('');
        }
    };

    const openTestModal = (cmd) => {
        setSelectedCmd({ ...cmd });
        setCollectionId(''); // 重置输入框
        setShowTestModal(true);
        setSendCmd(`调用 ${cmd.cmd}, collection_id: ${collectionId}`)
    };

    const handleCopyCmd = async () => {
        try {
            await navigator.clipboard.writeText(sendCmd);
            toast.success("命令已复制到剪贴板，3秒后自动跳转执行界面");
    
            // 等待3秒
            await new Promise(resolve => setTimeout(resolve, 3000));
    
            let bot_data = await api.get_user_bot_by_id(user.token, userType, selectedCmd.bot_id);
            let coze_url = bot_data?.bot_url || "";
            window.open(coze_url, '_blank'); // 打开新网页
    
        } catch (error) {
            toast.error("复制命令失败");
            console.error(error);
        }
    };

    return (
        <div className="container mt-4">
            <Button className="mb-3" onClick={() => setShowAddModal(true)}>
                添加命令
            </Button>
            <div className="table-responsive">
                {cmds.length === 0 ? (
                    <div>
                        <span>还没有命令，赶紧去添加吧</span>
                    </div>
                ) : (
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>标题</th>
                                <th>工作流名称</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cmds.map((cmd) => (
                                <tr key={cmd.id}>
                                    <td>{cmd.id}</td>
                                    <td>{cmd.title}</td>
                                    <td>{cmd.cmd}</td>
                                    <td>
                                        <Button
                                            variant="success"
                                            onClick={() => openTestModal(cmd)}
                                        >
                                            发送测试命令
                                        </Button>
                                        {' '}
                                        <Button variant="danger" onClick={() => handleDeleteCmd(cmd.id)}>
                                            删除
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </div>

            {/* 添加命令模态框 */}
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>添加新的命令</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>命令标题</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="输入命令标题"
                                value={newCmdTitle}
                                onChange={(e) => setNewCmdTitle(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>工作流名称</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="输入命令内容"
                                value={newCmd}
                                onChange={(e) => setNewCmd(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                        取消
                    </Button>
                    <Button variant="primary" onClick={handleAddCmd}>
                        添加命令
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* 发送测试命令模态框 */}
            {selectedCmd && (
                <Modal show={showTestModal} onHide={() => setShowTestModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>发送测试命令</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group>
                                <Form.Label>笔记ID</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="输入笔记ID"
                                    value={collectionId}
                                    onChange={(e) => setCollectionId(e.target.value)}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>命令内容</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={sendCmd}
                                    style={{ backgroundColor: '#eee' }}
                                    readOnly
                                />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCopyCmd}>
                            复制命令
                        </Button>
                        <Button variant="primary" onClick={handleTestCmd} disabled={loading}>
                            {loading ? (
                                <Spinner as="span" animation="border" size="sm" />
                            ) : (
                                "发送测试命令"
                            )}
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </div>
    );
};

export default BotCmdList;