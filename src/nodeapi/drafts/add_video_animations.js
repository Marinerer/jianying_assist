//创建文字动画
const { v4: uuidv4 } = require('uuid');
const { find_ruchang_animation_by_resource_id } = require('./data/video/ins');
const { find_out_animation_by_resource_id } = require('./data/video/out');
const { find_group_animation_by_resource_id } = require('./data/video/group');


//创建一个文字动画返回资源
async function add_video_animations(draft_content,in_resource_id='',out_resource_id="",loop_resource_id=""){
    let video_animations = []
    if(in_resource_id){
        let ruchang_ani =  find_ruchang_animation_by_resource_id(in_resource_id);
        video_animations.push(ruchang_ani)
    }
    if(out_resource_id){
        let chuchang_ani = find_out_animation_by_resource_id(out_resource_id);
        video_animations.push(chuchang_ani)
    }
    if(loop_resource_id){
        let loop_ani = find_group_animation_by_resource_id(loop_resource_id);
        video_animations.push(loop_ani)
    }
    let animations =  {
        "animations": video_animations,
        "id": uuidv4(),
        "multi_language_current": "none",
        "type": "sticker_animation"
    };
    draft_content.materials.material_animations.push(animations);
    return animations
}




module.exports = { add_video_animations };
