const { getAudioDuration } = require("../video/ffmpegHandler");
const { add_audio } = require("../drafts/add_audio");
const { add_text } = require("../drafts/add_text");
const { add_text_animations } = require("../drafts/add_text_animations");
const { add_new_tracks } = require("../drafts/add_tracks");
const { add_new_segments } = require("../drafts/add_tracks_segments");
const { add_video } = require("../drafts/add_video");
const { add_video_animations } = require("../drafts/add_video_animations");
const { add_keyframes } = require('../drafts/add_keyframes_v2')
const { add_video_effects } = require("../drafts/add_video_effects");
const { create_draft_file, save_draft_json, get_draft_json } = require("../drafts/drafts_task");



//导出剪映模版
async function jianyin_export_task(draft_path , details){    

    //获取内容
    let draft_content =  await get_draft_json(draft_path)
    
    draft_content.canvas_config.width = details[0].img_width;
    draft_content.canvas_config.height = details[0].img_height;
    

    //增加一条音频轨道
    let audio_track =  await add_new_tracks(draft_content,'audio');
    //增加一个字幕轨道
    let text_track =  await add_new_tracks(draft_content,'text')
    //增加一个图片轨道
    let image_track =  await add_new_tracks(draft_content,'video')    
    image_track.is_default_name =  true  //关闭自动删除空白的锁定
    image_track.flag = 2 //标识修改
    //增加特效轨道
    let texiao_track = await add_new_tracks(draft_content,'effect')

    //读取分镜数据
    for(let detaill of details){

        let audio_path = detaill.mp3_url
        let audio_01 =  await add_audio(draft_content,audio_path,detaill.duration*1000000)
        await add_new_segments(audio_track,audio_01.id,detaill.subtitle_start*1000000,detaill.duration*1000000);
        



        // 创建一个字幕素材
        let textSegments = splitText(detaill.subtitle_content);
        let totalDuration = detaill.duration * 1000000; // 总时长
        let totalLength = detaill.subtitle_content.replace(/[\。！？；，,.!?;]/g, '').length; // 总文字长度，不包括标点符号
        let currentStartTime = detaill.subtitle_start * 1000000; // 当前起始时间

        for (let segment of textSegments) {
            let segmentDuration = (segment.replace(/[\。！？；，,.!?;“‘'"]/g, '').length / totalLength) * totalDuration; // 根据文字占比折算时间
            if(!segment){
                continue
            }

            let text_01 = await add_text(draft_content, segment);
            // 转换文字格式
            text_01.content = JSON.stringify(generateStyledText(segment));
            let text_seg01 = await add_new_segments(text_track, text_01.id, currentStartTime, segmentDuration);
            text_seg01.clip.transform.y = -0.8;

            currentStartTime += segmentDuration; // 更新起始时间
        }
        

        
        if ( detaill.img_url ) {
            //有可能没有图标
            let image_path = detaill.img_url
            //创建一个图片素材
            // let image_info = await getImageDimensions(image_path);
            
            let image01 = await add_video(draft_content, image_path, detaill.subtitle_duration * 1000000, detaill.img_width, detaill.img_height, detaill.is_video);
            // let v_seg = await add_new_segments(image_track, image01.id, detaill.subtitle_start * 1000000, detaill.duration * 1000000);

            add_keyframes(draft_content,image_track,image01.id,15,detaill.animation,detaill.subtitle_start * 1000000,detaill.duration * 1000000)

            
        }
        
        //增加特效
        let texiao ;
        if(detaill.effects_resource_id){
            texiao =  await add_video_effects(draft_content, detaill.effects_resource_id )
            await add_new_segments(texiao_track,texiao.id,detaill.subtitle_start*1000000,detaill.duration*1000000 );
        }
        
        
    }


    save_draft_json(draft_path,draft_content)

}

// 按标点符号拆分文本的函数，并处理字数限制和合并小段
function splitText(text) {
    let segments = text.split(/[\。！？；，,.!?;]/).filter(segment => segment.trim().length > 0);
    let result = [];
    let tempSegment = "";

    segments.forEach(segment => {
        if (tempSegment.length + segment.length > 8) {
            result.push(tempSegment);
            tempSegment = segment;
        } else {
            tempSegment += segment;
        }
    });

    if (tempSegment.length > 0) {
        result.push(tempSegment);
    }

    // 合并小段落
    for (let i = 1; i < result.length; i++) {
        if (result[i].length < 2) {
            result[i - 1] += result[i];
            result.splice(i, 1);
            i--; // 调整索引以继续检查合并后的段落
        }
    }

    // 去掉标点符号
    result = result.map(segment => segment.replace(/[\。！？；，,.!?;]/g, ''));

    return result;
}


function hexToRgb(hex) {
    // Remove the hash at the start if it's there
    hex = hex.replace(/^#/, '');

    // Parse the r, g, b values
    let bigint = parseInt(hex, 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;

    // Normalize the values to be between 0 and 1
    r /= 255;
    g /= 255;
    b /= 255;

    // Return the RGB values as an array
    return [r, g, b];
}

function generateStyledText (a) {
    const defaultColor = hexToRgb('#ff7427'); // 默认颜色为白色
    const fontPath = "";
  
    let currentIndex = 0;
    let font_size = 8;
    let styles = [];
  
    // 添加剩余文本的样式
    if (currentIndex < a.length) {
      styles.push({
        fill: { content: { solid: { color: defaultColor } } },
        range: [currentIndex, a.length],
        size: font_size,
        font: { path: fontPath, id: "" }
      });
    }
  
    return {
      styles: styles,
      text: a
    };
  }

module.exports = { jianyin_export_task};