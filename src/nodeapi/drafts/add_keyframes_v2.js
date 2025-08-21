//创建文字动画
const { v4: uuidv4 } = require('uuid');

//创建一个文字动画返回资源
async function add_keyframes (draft_content, track, imageId, magnification=15,animation=1,   start=0,duration=0) {

  
  /**
  * 更改xy坐标
  * 
  */
  time_offset = duration;
  let _materialsVideoId = uuidv4()
  let _canvasesVideoId = uuidv4()
  let _soundVideoId = uuidv4()
  let _speedsVideoId = uuidv4()
  let _keyframeRefsId_v1 = uuidv4()
  let _keyframeRefsId_v2 = uuidv4()
  let scale_v1 = {
    "x": 0.0,
    "y": 0.0
  }
  let scale_v2 = {
    "x": 0.0,
    "y": 0.0
  }
  let scale_v3 = {
    "x": Number(magnification) / 100 + 1,
    "y": Number(magnification) / 100 + 1
  }
  let scale_v4 = {
    "x": Number(magnification) / 100 + 1,
    "y": Number(magnification) / 100 + 1
  }
  switch (animation) {
    case 0:
      scale_v1 = {
        "x": 0.0,
        "y": 0.0
      }
      scale_v2 = {
        "x": 0.0,
        "y": 0.0
      }
      break;
    case 1:
      scale_v1 = {
        "x": - Number(magnification) / 100,
        "y": 0.0
      }
      scale_v2 = {
        "x": Number(magnification) / 100,
        "y": 0.0
      }
      break;
    case 2:
      scale_v1 = {
        "x": Number(magnification) / 100,
        "y": 0.0
      }
      scale_v2 = {
        "x": - Number(magnification) / 100,
        "y": 0.0
      }
      break;
    case 3:
      scale_v1 = {
        "x": 0.0,
        "y": - Number(magnification) / 100
      }
      scale_v2 = {
        "x": 0.0,
        "y": Number(magnification) / 100
      }
      break;
    case 4:
      scale_v1 = {
        "x": 0.0,
        "y": Number(magnification) / 100
      }
      scale_v2 = {
        "x": 0.0,
        "y": - Number(magnification) / 100
      }
      break;
    case 5:
      scale_v3 = {
        "x": 1,
        "y": 1
      }
      scale_v4 = {
        "x": Number(magnification) / 100 + 1,
        "y": Number(magnification) / 100 + 1
      }
      break;
    case 6:
      scale_v3 = {
        "x": Number(magnification) / 100 + 1,
        "y": Number(magnification) / 100 + 1

      }
      scale_v4 = {
        "x": 1,
        "y": 1
      }
      break;

  }

  //开始的位置
  let _videoInfo_v1 = {
    "alpha": 1.0,
    "brightness_value": 0.0,
    "chroma_intensity": 0.0,
    "chroma_shadow": 0.0,
    "contrast_value": 0.0,
    "effect_adjust_param_1": 1.0,
    "effect_adjust_param_2": 1.0,
    "effect_adjust_param_3": 1.0,
    "fade_value": 0.0,
    "figure_slim": null,
    "figure_stretch": null,
    "figure_zoom": null,
    "filter_value": 1.0,
    "flags": 7,
    "graph": null,
    "highlight_value": 0.0,
    "id": _keyframeRefsId_v1,
    "last_volume": 1.0,
    "light_sensation_value": 0.0,
    "log_color_wheels_intensity": 1.0,
    "lut_value": 0.0,
    "mask_config": null,
    "particle_value": 0.0,
    "position": scale_v1,
    "primary_color_wheels_intensity": 1.0,
    "rotation": 0.0,
    "saturation_value": 0.0,
    "scale": scale_v3,
    "shadow_value": 0.0,
    "sharpen_value": 0.0,
    "smart_color_adjust_value": 0.0,
    "temperature_value": 0.0,
    "time_offset": 0,
    "tone_value": 0.0,
    "type": "video",
    "vignetting_value": 0.0,
    "volume": 1.0
  }

  //结束的位置
  let _videoInfo_v2 = {
    "alpha": 1.0,
    "brightness_value": 0.0,
    "chroma_intensity": 0.0,
    "chroma_shadow": 0.0,
    "contrast_value": 0.0,
    "effect_adjust_param_1": 1.0,
    "effect_adjust_param_2": 1.0,
    "effect_adjust_param_3": 1.0,
    "fade_value": 0.0,
    "figure_slim": null,
    "figure_stretch": null,
    "figure_zoom": null,
    "filter_value": 1.0,
    "flags": 7,
    "graph": null,
    "highlight_value": 0.0,
    "id": _keyframeRefsId_v2,
    "last_volume": 1.0,
    "light_sensation_value": 0.0,
    "log_color_wheels_intensity": 1.0,
    "lut_value": 0.0,
    "mask_config": null,
    "particle_value": 0.0,
    "position": scale_v2,
    "primary_color_wheels_intensity": 1.0,
    "rotation": 0.0,
    "saturation_value": 0.0,
    "scale": scale_v4,
    "shadow_value": 0.0,
    "sharpen_value": 0.0,
    "smart_color_adjust_value": 0.0,
    "temperature_value": 0.0,
    "time_offset": time_offset,
    "tone_value": 0.0,
    "type": "video",
    "vignetting_value": 0.0,
    "volume": 1.0
  }

  let canvasesInfo = {
    "album_image": "",
    "blur": 0.0,
    "color": "",
    "id": _canvasesVideoId,
    "image": "",
    "image_id": "",
    "image_name": "",
    "source_platform": 0,
    "team_id": "",
    "type": "canvas_color"
  }

  let _sound_channel_mappingsInfo = {
    "audio_channel_mapping": 0,
    "id": _speedsVideoId,
    "is_config_open": false,
    "type": "none"
  }
  let _speeds = {
    "curve_speed": null,
    "id": _soundVideoId,
    "mode": 0,
    "speed": 1.0,
    "type": "speed"
  }
  let _segmentsInfo = {
    "cartoon": false,
    "clip": {
      "alpha": 1.0,
      "flip": {
        "horizontal": false,
        "vertical": false
      },
      "rotation": 0.0,
      "scale": {
        "x": Number(magnification) / 100 + 1,
        "y": Number(magnification) / 100 + 1,
      },
      "transform": {
        "x": 0.0,
        "y": 0.0
      }
    },
    "common_keyframes": [],
    "enable_adjust": true,
    "enable_color_curves": true,
    "enable_color_wheels": true,
    "enable_lut": true,
    "enable_smart_color_adjust": false,
    "extra_material_refs": [
      _soundVideoId,
      _canvasesVideoId,
      _speedsVideoId
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
    "keyframe_refs": [
      _videoInfo_v1.id,
      _videoInfo_v2.id
    ],
    "last_nonzero_volume": 1.0,
    "material_id": imageId,
    "render_index": 0,
    "reverse": false,
    "source_timerange": {
      "duration": duration,
      "start":  0
    },
    "speed": 1.0,
    "target_timerange": {
      "duration": duration,
      "start":  start
    },
    "template_id": "",
    "template_scene": "default",
    "track_attribute": 0,
    "track_render_index": 0,
    "visible": true,
    "volume": 1.0
  }
  draft_content.keyframes.videos.push(_videoInfo_v1)
  draft_content.keyframes.videos.push(_videoInfo_v2)
  draft_content.materials.canvases.push(canvasesInfo)
  draft_content.materials.sound_channel_mappings.push(_sound_channel_mappingsInfo)
  draft_content.materials.speeds.push(_speeds)
  track.segments.push(_segmentsInfo)

}




module.exports = { add_keyframes };
