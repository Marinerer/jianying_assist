import React, { useState, useEffect } from 'react';
import { InputGroup, FormControl, DropdownButton, Dropdown, Button, Spinner } from 'react-bootstrap';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { sendMessage } from './cozeAPI';
import BotConfig from './cozeToken';
import { toast } from 'react-toastify';

const CommandCopyTool = ({ collection_id, page = 1, commands, onCallback }) => {
    const [input, setInput] = useState('');
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setInput(collection_id)
    }, [commands]);

    const handleCopy = () => {
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 2000);
    };

    const coze_api = async(cmd,fullCommand) => {
        if (!cmd) {
            toast.error('请输入命令');
            return;
        }
        setLoading(true); // Set loading to true before API call
        let res = await sendMessage(collection_id, cmd.cozeBotId, collection_id, fullCommand, cmd.cozeToken);

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

    const handleSelectCommand = (cmd) => {
        const fullCommand = `调用${cmd.command}，collection_id：${collection_id}，page：${page}`;
        setInput(fullCommand);
        coze_api(cmd,fullCommand); // 直接执行命令
    };

    return (
        <div>
            <InputGroup className="mb-3">
                <FormControl
                    placeholder="输入或选择命令"
                    aria-label="Command"
                    aria-describedby="basic-addon2"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                />
                <InputGroup.Text>
                    <CopyToClipboard text={input} onCopy={handleCopy}>
                        <Button variant={copied ? "success" : "outline-secondary"}>{copied ? "已复制" : "复制命令"}</Button>
                    </CopyToClipboard>
                </InputGroup.Text>
                <DropdownButton
                    as={InputGroup.Append}
                    variant={loading ? "outline-secondary" : "outline-primary"}
                    title={loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : "批量操作"}
                    id="input-group-dropdown-2"
                    disabled={loading}
                >
                    {commands.map((cmd, index) => (
                        <Dropdown.Item key={index} onClick={() => handleSelectCommand(cmd)}>
                            {cmd.text}
                        </Dropdown.Item>
                    ))}
                </DropdownButton>
            </InputGroup>
        </div>
    );
};

export default CommandCopyTool;