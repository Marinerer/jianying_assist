//给轨道增加视频或者图片
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// 返回新的视频内容
async function add_video(draft_content,video_path,duration,width,height,is_video=1){
    let video = {
        "aigc_type": "none",
        "audio_fade": null,
        "cartoon_path": "",
        "category_id": "",
        "category_name": "",
        "check_flag": 63487,
        "crop": {
            "lower_left_x": 0.0,
            "lower_left_y": 1.0,
            "lower_right_x": 1.0,
            "lower_right_y": 1.0,
            "upper_left_x": 0.0,
            "upper_left_y": 0.0,
            "upper_right_x": 1.0,
            "upper_right_y": 0.0
        },
        "crop_ratio": "free",
        "crop_scale": 1.0,
        "duration": duration,
        "extra_type_option": 0,
        "formula_id": "",
        "freeze": null,
        "has_audio": false,
        "height": height,
        "id": uuidv4(),
        "intensifies_audio_path": "",
        "intensifies_path": "",
        "is_ai_generate_content": false,
        "is_copyright": false,
        "is_text_edit_overdub": false,
        "is_unified_beauty_mode": false,
        "local_id": "",
        "local_material_id": "",
        "material_id": "",
        "material_name": path.basename(video_path),
        "material_url": "",
        "matting": {
            "flag": 0,
            "has_use_quick_brush": false,
            "has_use_quick_eraser": false,
            "interactiveTime": [],
            "path": "",
            "strokes": []
        },
        "media_path": "",
        "object_locked": null,
        "origin_material_id": "",
        "path": video_path,
        "picture_from": "none",
        "picture_set_category_id": "",
        "picture_set_category_name": "",
        "request_id": "",
        "reverse_intensifies_path": "",
        "reverse_path": "",
        "smart_motion": null,
        "source": 0,
        "source_platform": 0,
        "stable": {
            "matrix_path": "",
            "stable_level": 0,
            "time_range": {
                "duration": duration,
                "start": 0
            }
        },
        "team_id": "",
        "type": is_video? "video": "photo",//video//photo
        "video_algorithm": {
            "algorithms": [],
            "complement_frame_config": null,
            "deflicker": null,
            "gameplay_configs": [],
            "motion_blur_config": null,
            "noise_reduction": null,
            "path": "",
            "quality_enhance": null,
            "time_range": null
        },
        "width": width
    };
    draft_content.materials.videos.push(video);
    return video
}


module.exports = { add_video };
