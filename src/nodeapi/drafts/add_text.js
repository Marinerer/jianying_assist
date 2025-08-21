//创建文字内容
const { v4: uuidv4 } = require('uuid');

//增加一个文字轨道 ,返回内容和轨道ID
// type 值  text  文字
// video 视频
// effect 特效
// audio 音频
// 返回新的草稿内容和轨道ID
async function add_text(draft_content,content){
    let text =  {
        "add_type": 2,
        "alignment": 1,
        "background_alpha": 1.0,
        "background_color": "",
        "background_height": 0.14,
        "background_horizontal_offset": 0.0,
        "background_round_radius": 0.0,
        "background_style": 0,
        "background_vertical_offset": 0.0,
        "background_width": 0.14,
        "base_content": "",
        "bold_width": 0.0,
        "border_alpha": 1.0,
        "border_color": "",
        "border_width": 0.08,
        "caption_template_info": {
            "category_id": "",
            "category_name": "",
            "effect_id": "",
            "is_new": false,
            "path": "",
            "request_id": "",
            "resource_id": "",
            "resource_name": "",
            "source_platform": 0
        },
        "check_flag": 7,
        "combo_info": {
            "text_templates": []
        },
        "content": "<useLetterColor><size=15><color=(1,1,1,1)>[" + content + "]</color></size></useLetterColor>" ,
        "fixed_height": -1.0,
        "fixed_width": -1.0,
        "font_category_id": "",
        "font_category_name": "",
        "font_id": "",
        "font_name": "",
        "font_path": "/Applications/VideoFusion-macOS.app/Contents/Resources/Font/SystemFont/zh-hans.ttf",
        "font_resource_id": "",
        "font_size": 15.0,
        "font_source_platform": 0,
        "font_team_id": "",
        "font_title": "none",
        "font_url": "",
        "fonts": [],
        "force_apply_line_max_width": false,
        "global_alpha": 1.0,
        "group_id": "",
        "has_shadow": false,
        "id": uuidv4(),
        "initial_scale": 1.0,
        "inner_padding": -1.0,
        "is_rich_text": true,
        "italic_degree": 0,
        "ktv_color": "",
        "language": "",
        "layer_weight": 1,
        "letter_spacing": 0.0,
        "line_feed": 1,
        "line_max_width": 0.82,
        "line_spacing": 0.02,
        "multi_language_current": "none",
        "name": "",
        "original_size": [],
        "preset_category": "",
        "preset_category_id": "",
        "preset_has_set_alignment": false,
        "preset_id": "",
        "preset_index": 0,
        "preset_name": "",
        "recognize_task_id": "",
        "recognize_type": 0,
        "relevance_segment": [],
        "shadow_alpha": 0.9,
        "shadow_angle": -45.0,
        "shadow_color": "",
        "shadow_distance": 5.0,
        "shadow_point": {
            "x": 0.6363961030678928,
            "y": -0.6363961030678927
        },
        "shadow_smoothing": 0.45,
        "shape_clip_x": false,
        "shape_clip_y": false,
        "source_from": "",
        "style_name": "",
        "sub_type": 0,
        "subtitle_keywords": null,
        "subtitle_template_original_fontsize": 0.0,
        "text_alpha": 1.0,
        "text_color": "#ffde00",
        "text_curve": null,
        "text_preset_resource_id": "",
        "text_size": 30,
        "text_to_audio_ids": [],
        "tts_auto_update": false,
        "type": "subtitle",
        "typesetting": 0,
        "underline": false,
        "underline_offset": 0.22,
        "underline_width": 0.05,
        "use_effect_default_color": false,
        "words": {
            "end_time": [],
            "start_time": [],
            "text": []
        }
    };
    draft_content.materials.texts.push(text);
    return text
}


module.exports = { add_text };
