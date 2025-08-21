const { Client } = require("@gradio/client/dist/client.cjs");
const fs = require("fs");

const readVideoFile = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                return reject(err);
            }
            const blob = new Blob([data], { type: "video/mp4" });
            resolve(blob);
        });
    });
};

const processVideo = async (videoPath) => {
    try {
        const videoBlob = await readVideoFile(videoPath);
        const client = await Client.connect("http://0.0.0.0:7860/");
        const result = await client.predict("/gradio_process", { 
            video: videoBlob,
            threshold: 27,
        });

        console.log(result.data);

    } catch (error) {
        console.error("Error processing video:", error);
    }
};

processVideo("/path/to/your/video/file.mp4");

// 调用方法并传入要处理的视频文件路径
processVideo("/Users/hxc/translate_web/translate_web/plugins/video_scene/video/46c04229-4d04-480a-aa27-ee1cc23e3978.mp4");