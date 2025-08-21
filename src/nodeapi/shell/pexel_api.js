const axios = require('axios');

async function searchVideos(apiKey, query, perPage = 10, page = 1) {
    const url = 'https://api.pexels.com/videos/search';
    const headers = {
        'Authorization': apiKey
    };
    const params = {
        query: query,
        per_page: perPage,
        page: page
    };
    
    try {
        const response = await axios.get(url, { headers: headers, params: params });
        return response.data;
    } catch (error) {
        console.error('Error fetching videos:', error);
        throw error;
    }
}

// 使用示例
const apiKey = 'jjAgk0qIe6evRKf55EkDiKH2OJfbSdwayW2vbirSkYoDHWRRMRzneZKK';
const query = 'nature';  // 要搜索的视频关键词

searchVideos(apiKey, query)
    .then(videos => {
        videos.videos.forEach(video => {
            console.log(`Video ID: ${video.id}, URL: ${video.url}`);
            video.video_files.forEach(file => {
                console.log(`File Quality: ${file.quality}, File Link: ${file.link}`);
            });
        });
    })
    .catch(error => {
        console.error('Error:', error);
    });
