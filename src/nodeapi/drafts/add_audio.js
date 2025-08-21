//创建音频内容
const { v4: uuidv4 } = require('uuid');
const path = require('path');

//增加一个文字轨道 ,返回内容和轨道ID
// type 值  text  文字
// video 视频
// effect 特效
// audio 音频
// 返回新的草稿内容和轨道ID
async function add_audio(draft_content,audio_path,duration){
    let audio = {
        "app_id": 0,
        "category_id": "",
        "category_name": "local",
        "check_flag": 1,
        "duration": duration,
        "effect_id": "",
        "formula_id": "",
        "id": uuidv4(),
        "intensifies_path": "",
        "local_material_id": uuidv4(),
        "music_id": uuidv4(),
        "name": path.basename(audio_path),
        "path": audio_path,
        "request_id": "",
        "resource_id": "",
        "source_platform": 0,
        "team_id": "",
        "text_id": "",
        "tone_category_id": "",
        "tone_category_name": "",
        "tone_effect_id": "",
        "tone_effect_name": "",
        "tone_speaker": "",
        "tone_type": "",
        "type": "extract_music",
        "video_id": "",
        "wave_points": []
      };
    
    draft_content.materials.audios.push(audio);
    return audio
}


module.exports = { add_audio };
