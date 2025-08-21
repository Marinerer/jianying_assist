//把数据内容增加到轨道上面
const { v4: uuidv4 } = require('uuid');

//增加一个文字轨道 ,返回内容和轨道ID
// type 值  text  文字
// video 视频
// effect 特效
// audio 音频
// 返回新的草稿内容和轨道ID
async function add_new_segments(track,material_id,start,duration){
    let segments = {
        "caption_info": null,
        "cartoon": false,
        "clip": {
            "alpha": 1.0,
            "flip": {
                "horizontal": false,
                "vertical": false
            },
            "rotation": 0.0,
            "scale": {
                "x": 1.0,
                "y": 1.0
            },
            "transform": {
                "x": 0.0,
                "y": 0.0
            }
        },
        "common_keyframes": [],
        "enable_adjust": true,
        "enable_color_correct_adjust": false,
        "enable_color_curves": true,
        "enable_color_match_adjust": false,
        "enable_color_wheels": true,
        "enable_lut": true,
        "enable_smart_color_adjust": false,
        "extra_material_refs": [
        ],
        "group_id": "",
        "hdr_settings": {
            "intensity": 1.0,
            "mode": 1,
            "nits": 1000
        },
        "id": uuidv4(),
        "intensifies_audio": false,
        "is_placeholder": false,
        "is_tone_modify": false,
        "keyframe_refs": [],
        "last_nonzero_volume": 1.0,
        "material_id": material_id,
        "render_index": 1,
        "responsive_layout": {
            "enable": false,
            "horizontal_pos_layout": 0,
            "size_layout": 0,
            "target_follow": "",
            "vertical_pos_layout": 0
        },
        "reverse": false,
        "source_timerange": {
            "duration": duration,
            "start": 0
        },
        "speed": 1.0,
        "target_timerange": {
            "duration": duration,
            "start": start
        },
        "template_id": "",
        "template_scene": "default",
        "track_attribute": 0,
        "track_render_index": 3,
        "uniform_scale": {
            "on": true,
            "value": 1.0
        },
        "visible": true,
        "volume": 1.0
    };


    track.segments.push(segments);

    return segments
}


module.exports = { add_new_segments };
