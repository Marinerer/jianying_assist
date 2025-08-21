import React, { useState, useEffect } from 'react';
import { DropdownButton, Dropdown, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { sendMessage } from './cozeAPI';

const CommandExecutionTool = ({ data, onCallback, commands }) => {
    const [loading, setLoading] = useState(false);
    const [availableCommands, setAvailableCommands] = useState(commands);

    useEffect(() => {
        setAvailableCommands(commands);
    }, [commands]);

    const executeCommand = async(cmd) => {
        if (!cmd) {
            toast.error('请选择命令');
            return;
        }
        setLoading(true);

        // 构建完整的命令字符串
        const fullCommand = `调用 ${cmd.command}，collection_id：${data.collection_id}，collection_detail_id：${data.collection_detail_id}`;

        let res = await sendMessage(data.collection_id, cmd.cozeBotId, '7638475', fullCommand, cmd.cozeToken);
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
        if (onCallback) {
            onCallback(res);
        }
        setLoading(false);
            
    };

    return (
        <div>
            <DropdownButton
                id="dropdown-basic-button"
                title={loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : "生成操作"}
                onSelect={(eventKey) => {
                    const cmd = availableCommands.find(c => c.command === eventKey);
                    executeCommand(cmd);
                }}
            >
                {availableCommands.map((cmd, index) => (
                    <Dropdown.Item key={index} eventKey={cmd.command}>
                        {cmd.text}
                    </Dropdown.Item>
                ))}
            </DropdownButton>
        </div>
    );
};

export default CommandExecutionTool;