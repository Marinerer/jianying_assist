// commandService.js

import ApiService from '../../api/ApiService';
import LocalDataService from '../../api/LocalDataService';
import { toast } from 'react-toastify';

const api = new ApiService();
const CACHE_KEY = 'command_cache';
const CACHE_TIMESTAMP_KEY = 'command_cache_timestamp';
const CACHE_DURATION = 60 * 1000; // 1分钟

const base_token = "pat_85vFPs3LSPB0LJH8EUEF5MUMRV7DqP1gD3KlqKYQpMuDSEzX9x4kBjsEDDymZfQX";
const base_bot_id = "7397427413929443365";

const customCommands = [
    { text: "生成图片", command: "honghua", cozeBotId: base_bot_id, cozeToken: base_token },
    { text: "生成音频", command: "audio", cozeBotId: base_bot_id, cozeToken: base_token },
    { text: "生成鸡汤配图", command: "batch_image_jitang_no_llm", cozeBotId: base_bot_id, cozeToken: base_token },
    { text: "去图片背景", command: "batch_remove_bg", cozeBotId: base_bot_id, cozeToken: base_token },
    { text: "提取鸡汤关键词", command: "batch_jitang_auto_create_title", cozeBotId: base_bot_id, cozeToken: base_token },
    // 可以添加更多自定义命令
];

export const fetchCommandsAndToken = async () => {
    const currentTime = Date.now();
    const cachedData = LocalDataService.loadData(CACHE_KEY);
    const lastFetchTime = LocalDataService.loadData(CACHE_TIMESTAMP_KEY);

    // 检查缓存是否有效
    if (cachedData && lastFetchTime && (currentTime - lastFetchTime < CACHE_DURATION)) {
        return cachedData;
    }

    try {
        const [cmdListRes, tokenRes] = await Promise.all([
            api.get_open_cmd_list(LocalDataService.load_user_data().token, 1),
            api.get_user_coze_token(LocalDataService.load_user_data().token, 1)
        ]);

        if (cmdListRes && cmdListRes.cmd_list && cmdListRes.bot_info && tokenRes && tokenRes.token) {
            const coze_bot_id = cmdListRes.bot_info.coze_bot_id;
            const coze_token = tokenRes.token;
            const fetchedCommands = cmdListRes.cmd_list.map(cmd => ({
                text: cmd.title, // 命令描述
                command: cmd.cmd, // 命令文本
                cozeBotId: coze_bot_id, // 添加 coze_bot_id 到命令
                cozeToken: coze_token // 添加 coze_token 到命令
            }));

            // 合并自定义命令和从API获取的命令
            const allCommands = [...customCommands, ...fetchedCommands];

            // 更新缓存
            LocalDataService.storeData(CACHE_KEY, allCommands);
            LocalDataService.storeData(CACHE_TIMESTAMP_KEY, currentTime);
            console.log(allCommands)
            return allCommands;
        } else {
            throw new Error("Invalid response structure");
        }
    } catch (error) {
        
        return customCommands;
    }
};