// CozeAPI.js
function sendMessage(conversationId, botId, user, query, token) {
    const url = 'https://api.coze.cn/open_api/v2/chat';
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Host': 'api.coze.cn',
        'Connection': 'keep-alive'
    };
    const body = JSON.stringify({
        conversation_id: conversationId,
        bot_id: botId,
        user: user,
        query: query,
        stream: false
    });

    return fetch(url, {
        method: 'POST',
        headers: headers,
        body: body
    })
    .then(response => response.json())
    .then(data => data)
    .catch(error => {
        console.error('Error:', error);
        throw error; // 抛出错误以便调用者处理
    });
}

export { sendMessage };
