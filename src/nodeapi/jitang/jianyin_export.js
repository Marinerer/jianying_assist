const { getAudioDuration } = require("../video/ffmpegHandler");
const { add_audio } = require("../drafts/add_audio");
const { add_text } = require("../drafts/add_text");
const { add_text_animations } = require("../drafts/add_text_animations");
const { add_new_tracks } = require("../drafts/add_tracks");
const { add_new_segments } = require("../drafts/add_tracks_segments");
const { add_video } = require("../drafts/add_video");
const { add_video_animations } = require("../drafts/add_video_animations");
const { add_video_effects } = require("../drafts/add_video_effects");
const { create_draft_file, save_draft_json, get_draft_json } = require("../drafts/drafts_task");



//导出剪映模版
async function jianyin_export_task(draft_path , details){    

    
    //获取内容
    let draft_content =  await get_draft_json(draft_path)
    draft_content.canvas_config.width = 1920;
    draft_content.canvas_config.height = 1080;
    

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
        
        //创建一个字幕素材
        let text_01 =  await add_text(draft_content,detaill.subtitle_content);
        //转换文字格式
        text_01.content =JSON.stringify(  generateStyledText(detaill.subtitle_content,detaill.key_words))
        let text_seg01 = await add_new_segments(text_track,text_01.id,detaill.subtitle_start*1000000,detaill.duration*1000000);
        text_seg01.clip.transform.y = -0.1
        
        // 增加动画
        let tmp_ani = await add_text_animations(draft_content, detaill.tx_in_ani_res_id, detaill.tx_out_ani_res_id, detaill.tx_loop_ani_res_id);
        text_seg01.extra_material_refs.push(tmp_ani.id)

        
        if ( detaill.img_url ) {
            //有可能没有图标
            let image_path = detaill.img_url
            //创建一个图片素材
            // let image_info = await getImageDimensions(image_path);
            let image01 = await add_video(draft_content, image_path, detaill.subtitle_duration * 1000000, detaill.img_width, detaill.img_height, 0);
            let v_seg = await add_new_segments(image_track, image01.id, detaill.subtitle_start * 1000000, detaill.duration * 1000000);
            //调整位置和缩放
            v_seg.clip.scale.x = 0.7
            v_seg.clip.scale.y = 0.7
            v_seg.clip.transform.y = 0.44
            //增加视频动画
            //增加动画
            let v_ani01 = await add_video_animations(draft_content, detaill.im_in_ani_res_id, detaill.im_out_ani_res_id, detaill.im_loop_ani_res_id);
            v_seg.extra_material_refs.push(v_ani01.id)

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

//转换文字风格
function generateStyledText(a, b) {
    const keywords = b.split('|');
    const defaultColor = [1, 1, 1]; // 默认颜色为白色
    const highlightColor = [1, 0.843137264251709, 0]; // 高亮颜色为黄色
    const fontPath = "";
    
    let currentIndex = 0;
    let font_size = 10;
    let styles = [];

    keywords.forEach(keyword => {
        const keywordIndex = a.indexOf(keyword, currentIndex);
        
        if (keywordIndex !== -1) {
            // 添加普通文本的样式
            if (keywordIndex > currentIndex) {
                styles.push({
                    fill: { content: { solid: { color: defaultColor } } },
                    range: [currentIndex, keywordIndex],
                    size: font_size,
                    font: { path: fontPath, id: "" }
                });
            }
            
            // 添加关键词的样式
            styles.push({
                fill: { content: { solid: { color: highlightColor } } },
                range: [keywordIndex, keywordIndex + keyword.length],
                size: font_size,
                font: { path: fontPath, id: "" },
                useLetterColor: true
            });
            
            currentIndex = keywordIndex + keyword.length;
        }
    });

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