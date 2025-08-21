// 使用示例
const webhookUrl = "https://open.feishu.cn/open-apis/bot/v2/hook/2569e7bf-0f32-4d73-94e1-9c8cb40e201d";

async function sendMessageToFeishu( message) {
    const payload = {
        msg_type: "text",
        content: {
            text: message
        }
    };

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            console.log('Message sent successfully.');
        } else {
            console.error(`Failed to send message. Status code: ${response.status}, Response: ${await response.text()}`);
        }
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

// 导出方法以便在其他文件中使用
module.exports = sendMessageToFeishu;