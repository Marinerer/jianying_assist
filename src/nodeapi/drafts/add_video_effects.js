//创建特效
const { find_texiao_animation_by_resource_id } = require('./data/texiao/texiao');

// 返回新的特效
async function add_video_effects(draft_content,resource_id){
    let effect = await find_texiao_animation_by_resource_id(resource_id)
    draft_content.materials.video_effects.push(effect);
    return effect
}

module.exports = { add_video_effects };
