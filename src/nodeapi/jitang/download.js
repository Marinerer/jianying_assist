const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { create_draft_file, save_draft_json, get_draft_json } = require("../drafts/drafts_task");
const { v4: uuidv4 } = require('uuid');
const { shell } = require('electron');

// 辅助函数：发送日志消息到前端
const sendLogMessage = (event, message) => {
  if (event && event.sender) {
    event.sender.send('download-log', { message });
    console.log(message); // 同时在控制台输出日志
  }
};

async function downloadFile (url, destPath, fileExt="", event = null, retries = 3) {
  let attempt = 1;
  
  while (attempt <= retries + 1) { // 初始尝试 + 重试次数
    try {
      url = url.replace("online_https", "https");
      if (attempt === 1) {
        sendLogMessage(event, `开始下载文件: ${url}`);
      } else {
        sendLogMessage(event, `第${attempt-1}次重试下载文件: ${url}`);
      }
      
      const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream',
        timeout: 15000 // 增加超时时间
      });

      // 从 url 中获取文件名和扩展名
      let fileName = uuidv4();
      if(fileExt){
        fileName = fileName + fileExt;
      }

      const filePath = path.join(destPath, fileName);

      // 创建写入流并保存文件
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      return await new Promise((resolve, reject) => {
        writer.on('finish', () => {
          sendLogMessage(event, `文件下载完成: ${fileName}`);
          resolve({ filePath, fileName });
        });
        writer.on('error', (err) => {
          sendLogMessage(event, `文件写入失败: ${err.message}`);
          reject(err);
        });
      });
    } catch (error) {
      if (attempt > retries) {
        // 已达到最大重试次数，抛出最终错误
        sendLogMessage(event, `文件下载失败，已重试${retries}次: ${error.message}`);
        throw new Error('文件下载失败，已达最大重试次数: ' + error.message);
      }
      
      // 重试前等待时间（递增）
      const waitTime = attempt * 1000;
      sendLogMessage(event, `下载失败，${waitTime/1000}秒后进行第${attempt}次重试: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      attempt++;
    }
  }
}



async function downloadItem (url, retries = 3, delay = 1000) {
  // console.log(url);

  try {
    let axiosConfig = {
      method: 'GET',
      url: url,
      responseType: 'json',
      timeout: 10000
    };
    const response = await axios(axiosConfig);

    return response.data;
  } catch (error) {
    if (retries <= 0) throw new Error('下载失败，已达最大重试次数');
    console.log(`下载失败，${delay / 1000}秒后进行第${4 - retries}次重试`);
    await new Promise(res => setTimeout(res, delay));
    return downloadItem(url,  retries - 1, delay);
  }
}


function extractIdFromUrl(url) {
  const regex = /\/draft\/([a-f0-9-]+)\.json/;
  const match = url.match(regex);
  if (match && match[1]) {
      return match[1];
  }
  return null;
}


async function downloadDraft (event, data) {
  const urls = data.url.split("\n").filter(url => url.trim());
  const totalUrls = urls.length;
  
  // 发送总文件数计数到前端
  event.sender.send('file-download-count', { total: totalUrls });
  
  sendLogMessage(event, `开始处理草稿下载，共有 ${totalUrls} 个草稿地址`);

  let successCount = 0;
  let failedCount = 0;
  let index = 1;
  
  for(let url of urls){
    url = url.trim();
    if(url){
      sendLogMessage(event, `开始处理第 ${index} 个草稿: ${url}`);
      data.url = url;
      try {
        let draft_path = await downloadDraft_one(event, data, index, totalUrls);
        if (draft_path) {
          sendLogMessage(event, `第 ${index} 个草稿处理完成，保存至: ${draft_path}`);
          successCount++;
        } else {
          failedCount++;
        }
      } catch (error) {
        sendLogMessage(event, `第 ${index} 个草稿处理失败: ${error.message}`);
        failedCount++;
      }
      
      // 更新下载计数
      event.sender.send('file-download-count', { 
        total: totalUrls,
        success: successCount,
        failed: failedCount
      });
      
      index++;
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  // sendLogMessage(event, `所有草稿处理完成，成功: ${successCount}，失败: ${failedCount}`);
  event.sender.send('download-complete', { 
    draftPath: '下载完成',
    success: successCount,
    failed: failedCount,
    total: totalUrls
  });
}


async function downloadDraft_one (event, data, index = 1, url_total = 1) {
  let url, destPath
  console.log(data, '数据')
  url = data.url
  destPath = data.destPath
  
  if(!destPath){
    sendLogMessage(event, "未设置剪映草稿保存路径");
    event.sender.send('download-error', { error: "请先在个人中心设置剪映草稿保存路径" });
    return
  }
  
  let vip_level = data.user_info.vip_level
  // if(vip_level == 0){
  //   console.log("vip_level == 0")
  //   event.sender.send('download-complete', { draftPath: destPath });
  //   return
  // }

  let user_info = data.user_info
  let token = user_info.token
  
  sendLogMessage(event, `正在解析剪映草稿地址: ${url}`);
  
  try {
    let res = await parseJYDraft(event, token, url)
    let draft_content = res.data
    
    sendLogMessage(event, `草稿解析成功，准备下载资源`);

    //创建一个目录用来保存下载的内容。
    let file_dir = uuidv4() + ""
    let resource_path = path.join(destPath, file_dir)
    if (!fs.existsSync(resource_path)) {
      fs.mkdirSync(resource_path, { recursive: true });
      sendLogMessage(event, `创建资源目录: ${resource_path}`);
    }
    
    const totalAudios = draft_content.materials.audios.length;
    const totalVideos = draft_content.materials.videos.length;
    sendLogMessage(event, `检测到音频资源: ${totalAudios} 个，视频资源: ${totalVideos} 个`);
    
    let downloadedAudios = 0;
    let downloadedVideos = 0;
    // 抽取draft_content 里面的网络资源

    for (const audio of draft_content.materials.audios) {
      try {
        sendLogMessage(event, `开始下载音频 ${downloadedAudios + 1}/${totalAudios}`);
        let { filePath, fileName } = await downloadFile(audio.path, resource_path, '.mp3', event, 3);
        console.log("filePath", filePath);
        console.log("fileName", fileName);
        audio.path = path.join('##_draftpath_placeholder_0E685133-18CE-45ED-8CB8-2904A212EC80_##/', file_dir, fileName);
      } catch (error) {
        console.error(`音频下载失败: ${audio.path}`, error);
        sendLogMessage(event, `音频下载失败，已达最大重试次数: ${error.message}`);
        audio.path = ""; // 下载失败时设置为空字符串
      }
      downloadedAudios++;
      event.sender.send('download-progress', {
        type: 'audio',
        total: totalAudios,
        downloaded: downloadedAudios,
        index: index,
        url_total: url_total
      });
    }

    for (const video of draft_content.materials.videos) {
      try {
        let fileExt = ""
        if(video.type == "video"){
          fileExt = ".mp4"
        }else{
          fileExt = ".png"
        }

        sendLogMessage(event, `开始下载${video.type == "video" ? '视频' : '图片'} ${downloadedVideos + 1}/${totalVideos}`);
        let { filePath, fileName } = await downloadFile(video.path, resource_path, fileExt, event, 3);
        console.log("filePath", filePath)
        console.log("fileName", fileName)
        video.path = path.join('##_draftpath_placeholder_0E685133-18CE-45ED-8CB8-2904A212EC80_##/', file_dir, fileName)

      } catch (error) {
        console.error(`视频下载失败: ${video.path}`, error);
        sendLogMessage(event, `视频下载失败，已达最大重试次数: ${error.message}`);
        video.path = ""; // 下载失败时设置为空字符串
      }
      downloadedVideos++;
      event.sender.send('download-progress', {
        type: 'video',
        total: totalVideos,
        downloaded: downloadedVideos,
        index: index,
        url_total: url_total
      });
    }

    draft_content.materials.audios.forEach((audio) => {
      console.log(audio)
    });

    draft_content.materials.videos.forEach((video) => {
      console.log(video)
    });

    // console.log(draft_content)

    const now = new Date();
    const month = now.getMonth() + 1; // 月份从0开始，所以需要加1
    const day = now.getDate();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const second = now.getSeconds();
    // let draft_name = `${month}-${day}_${hour}:${minute}:${second}`;
    let draft_name = extractIdFromUrl(url);
    sendLogMessage(event, `创建剪映草稿文件: ${draft_name}`);
    let draft_path = await create_draft_file(destPath, draft_name);
    console.log(draft_path)

    //把file_dir 文件夹移动到draft_path下
    await new Promise(resolve => setTimeout(resolve, 1000));
    fs.renameSync(resource_path, path.join(draft_path, file_dir));
    sendLogMessage(event, `移动资源文件夹到草稿目录`);

    // 保存draft_content 到draft_path下
    let draft_content_path = path.join(draft_path, file_dir + ".json")
    fs.writeFileSync(draft_content_path, JSON.stringify(draft_content, null, 0), 'utf-8')
    sendLogMessage(event, `保存草稿内容文件: ${file_dir}.json`);

    // 保存draft_content.json
    let draft_info_path = path.join(draft_path, "draft_content.json")
    fs.writeFileSync(draft_info_path, JSON.stringify(draft_content, null, 0), 'utf-8')

    // 保存draft_info.json
    draft_info_path = path.join(draft_path, "draft_info.json")
    fs.writeFileSync(draft_info_path, JSON.stringify(draft_content, null, 0), 'utf-8')
    sendLogMessage(event, `保存草稿信息文件成功`);

    if(data.openAfterDownload){
      sendLogMessage(event, `正在打开草稿目录: ${draft_path}`);
      shell.openPath(draft_path);
    }

    return draft_path
  } catch (error) {
    sendLogMessage(event, `处理草稿过程中发生错误: ${error.message}`);
    return null;
  }
}



async function parseJYDraft(event, token, draftUrl) {
  try {
    sendLogMessage(event, `请求解析剪映草稿: ${draftUrl}`);
    const response = await axios.post('https://ts-api.fyshark.com/api/parse_jydraft', {
      token: token,
      user_type: 1,
      draft_url: draftUrl
    }, {
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    sendLogMessage(event, `草稿解析请求成功`);
    return response.data;
  } catch (error) {
    console.error('请求失败:', error.message);
    sendLogMessage(event, `草稿解析请求失败: ${error.message}`);
    event.sender.send('download-error', { error: error.response.data.detail });
    throw error;
  }
}


module.exports = {
  downloadFile,
  downloadItem,
  downloadDraft,
  downloadDraft_one,
  parseJYDraft
};