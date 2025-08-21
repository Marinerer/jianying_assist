const path = require('path');
const fs = require('fs');
const os = require('os');
const Jimp = require('jimp');
const ffmpeg = require('fluent-ffmpeg');
const { app } = require('electron');
const { parseSync } = require('subtitle');


const { setFfmpegPaths } = require('./ffmpegConfig');
if(app){
    setFfmpegPaths(process.resourcesPath, app.isPackaged );
}


function changeExtensionToWav(filePath, newExtension = '.wav',ext='') {
    let parsedPath = path.parse(filePath);
    // 更改文件扩展名为 .wav
    parsedPath.ext = newExtension;
    parsedPath.base = parsedPath.name +ext + parsedPath.ext;
    // 使用 path.format 返回新路径
    return path.format(parsedPath);
}

//提取视频的分辨率
async function getVideoResolution(videoPath) {
  console.log(videoPath,'videoPath');
    try {
        const videoInfo = await new Promise((resolve, reject) => {
            ffmpeg.ffprobe(videoPath, function(err, metadata) {
                if (err) {
                    reject(err);
                } else {
                    resolve(metadata);
                }
            });
        });

        const videoStream = videoInfo.streams.find(stream => stream.codec_type === 'video');
           
        if (!videoStream) {
            throw new Error('No video stream found');
        }

        const resolution = {
            width: videoStream.width,
            height: videoStream.height
        };

        console.log(resolution);
        return resolution;

    } catch (error) {
        console.error("Error fetching video resolution:", error);
        throw error;
    }
}

async function extractFramesFromVideoArea(videoPath, rect, outputDir) {
    try {
        const { startX, startY, width, height } = rect;

        // Ensure output directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const outputPattern = path.join(outputDir, 'frame_%03d.png');

        const outputPath = await new Promise((resolve, reject) => {
            ffmpeg(videoPath)
                .outputOptions([
                    `-vf crop=${width}:${height}:${startX}:${startY}`,
                    '-r 1'
                ])
                .output(outputPattern)
                .on('end', function() {
                    resolve(outputPattern);
                })
                .on('error', function(err) {
                    reject(err);
                })
                .run();
        });

        return outputPath;
    } catch (error) {
        console.error("Error extracting frames from video:", error);
        throw error;
    }
}


//提取视频中的音频
async function getVideoMp3Handler(event, data) {
    const videoPath = data.mp4_url;
    const savePath = changeExtensionToWav(videoPath,'.wav','');  // 请确保 savePath 的扩展名是 .wav
    
        const outputPath = await new Promise((resolve, reject) => {
            ffmpeg(videoPath)
                .audioCodec('pcm_s16le') // 指定为.wav格式的音频编解码器
                .audioFrequency(16000)
                .toFormat('wav')  // 指定输出格式为WAV
                .output(savePath)
                .on('end', function() {
                    resolve(savePath);
                })
                .on('error', function(err) {
                    reject(err);
                })
                .run();
        });

        return outputPath;
    
}


async function getVideoDuration(videoPath) {
    try {
        const videoInfo = await new Promise((resolve, reject) => {
            ffmpeg.ffprobe(videoPath, function(err, metadata) {
                if (err) {
                    reject(err);
                } else {
                    resolve(metadata);
                }
            });
        });
        // 根据视频元数据获取视频的长度（单位为秒）
        const duration = parseFloat(videoInfo.format.duration);
        console.log(duration);
        return duration;

    } catch (error) {
        console.error("Error fetching video duration:", error);
        throw error;
    }
}

//裁剪尾部音频
async function trimAudio(inputFile, duration, outputFile) {
    return new Promise((resolve, reject) => {
      ffmpeg(inputFile)
        .setStartTime(0)
        .setDuration(duration)
        .output(outputFile)
        .on('end', () => {
          console.log('Audio trimmed successfully');
          resolve(outputFile);
        })
        .on('error', (err) => {
          console.error('Error trimming audio:', err);
          reject(err);
        })
        .run();
    });
  }


async function getAudioDuration(audioPath) {
    try {
        const audioInfo = await new Promise((resolve, reject) => {
            ffmpeg.ffprobe(audioPath, function(err, metadata) {
                if (err) {
                    reject(err);
                } else {
                    resolve(metadata);
                }
            });
        });
        // 根据音频元数据获取音频的长度（单位为秒）
        const duration = parseFloat(audioInfo.format.duration);
        console.log(duration);
        return duration;

    } catch (error) {
        console.error("Error fetching audio duration:", error);
        throw error;
    }
}


async function getVideoImageHandler(event, data) {
    const videoPath = data.mp4_url;
    
    let time_data = await getVideoDuration(videoPath);

    // 检查 time_data 的值是否有效
    if (time_data <= 0) {
        console.error("Invalid video duration:", time_data);
        throw new Error("Invalid video duration");
    }

    let timeInSeconds = time_data * data.pos / 100;

    // 如果视频不足1秒，直接设置 timeInSeconds 为 0
    if (time_data < 1) {
        timeInSeconds = 0;
    } else {
        // 检查 timeInSeconds 的值是否在有效范围内
        timeInSeconds = Math.min(timeInSeconds, time_data - 0.01); // 防止 timeInSeconds 等于 time_data
        timeInSeconds = Math.max(timeInSeconds, 0.01); // 防止 timeInSeconds 等于 0
    }

    console.log(timeInSeconds);
    const savePath = changeExtensionToWav(videoPath,'.png',"_"+data.pos);
    console.log(savePath);

    try {
        const outputPath = await new Promise((resolve, reject) => {
            ffmpeg(videoPath)
            .seekInput(timeInSeconds)
            .frames(1)
            .output(savePath)
            .on('end', function() {
                resolve(savePath);
            })
            .on('error', function(err) {
                reject(err);
            })
            .run();
        });
        return outputPath;
    } catch (error) {
        console.error("Error taking screenshot from video:", error);
        throw error;
    }
}


async function parseSrt(filePath) {
    const srtData = fs.readFileSync(filePath, { encoding: 'utf-8' });
    return parseSync(srtData);
  }


// 辅助函数，用于处理单个字幕片段的剪切
function processSegment(inputVideoPath, subtitle, index, outputPath) {
    return new Promise((resolve, reject) => {
      const start = subtitle.data.start/1000;
      const end = subtitle.data.end/1000;
      const duration = end - start;
    //   console.log(duration);
      const formattedIndex = String(index + 1).padStart(3, '0');
      const outputSegmentPath = path.join(outputPath, `segment-${formattedIndex}.mp4`);
  
      subtitle.segmentPath = outputSegmentPath;
  
      ffmpeg(inputVideoPath)
        .seekInput(start)
        .duration(duration)
        .output(outputSegmentPath)
        .on('end', () => {
          console.log(`Segment ${formattedIndex} finished: ${outputSegmentPath}`);
          resolve(subtitle);
        })
        .on('error', (err) => {
          console.error('Error:', err);
          reject(err);
        })
        .run();
    });
  }
  
  // 主函数，按批次顺序处理字幕片段
  async function sliceVideo(inputVideoPath, subtitles, outputPath, maxConcurrent = 5) {
    let index = 0;
    const results = [];
  
    async function nextBatch() {
      const batch = [];
      for(let i = 0; i < maxConcurrent && index < subtitles.length; i++, index++) {
        batch.push(processSegment(inputVideoPath, subtitles[index], index, outputPath));
      }
      const batchResults = await Promise.all(batch);
      results.push(...batchResults);
      if (index < subtitles.length) {
        return nextBatch();
      }
    }
  
    await nextBatch();
    return results;
  }
  
async function splitVideoBySrt(videoPath, srtPath,outputPath) {
    // const outputPath = 'output'; // 输出目录（确保此目录存在或创建它）
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }
    const subtitles =  await parseSrt(srtPath);
    // console.log(subtitles);
    let new_subtitles =  await sliceVideo(videoPath, subtitles, outputPath);
    // console.log(new_subtitles)
    return new_subtitles
}

async function splitVideoByFixedInterval(videoPath, intervalInSeconds, outputPath) {
    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
    }

    // Get video total duration
    const totalDuration = await getVideoDuration(videoPath);
    // Calculate number of splits
    const splits = Math.ceil(totalDuration / intervalInSeconds);
    const promises = [];

    for (let i = 0; i < splits; i++) {
        const startTime = i * intervalInSeconds;
        const duration = Math.min(intervalInSeconds, totalDuration - startTime);
        const formattedIndex = String(i + 1).padStart(3, '0');
        const outputFile = path.join(outputPath, `output_${formattedIndex}.mp4`);

        // Cutting video using ffmpeg, returning a promise per segment
        const promise = new Promise((resolve, reject) => {
            ffmpeg(videoPath)
                .seekInput(startTime)
                .duration(duration)
                .output(outputFile)
                .on('end', () => {
                    console.log(`Segment ${formattedIndex} finished: ${outputFile}`);
                    resolve({
                        segmentPath: outputFile,
                        duration: duration,
                        data:{
                            text:''
                        }
                    });
                })
                .on('error', (err) => {
                    console.error('Error:', err);
                    reject(err);
                })
                .run();
        });

        promises.push(promise);
    }

    // Wait for all promises to resolve
    const results = await Promise.all(promises);
    console.log(`Video has been split into ${splits} parts.`);
    return results;
}







module.exports = { getVideoMp3Handler, getVideoImageHandler ,changeExtensionToWav,getVideoResolution,extractFramesFromVideoArea ,getAudioDuration,splitVideoBySrt,splitVideoByFixedInterval,trimAudio,getVideoDuration};