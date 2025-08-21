//创建文字动画
const { v4: uuidv4 } = require('uuid');
const { find_ruchang_animation_by_resource_id } = require('./data/text/ruchang');
const { find_chuchang_animation_by_resource_id } = require('./data/text/chuchang');
const { find_xunhuan_animation_by_resource_id } = require('./data/text/xunhuan');

//创建一个文字动画返回资源
async function add_text_animations(draft_content,ruchang_resource_id='',chuchang_resource_id="",xuhuan_resource_id=""){
    let text_animations = []
    if(ruchang_resource_id){
        let ruchang_ani =  find_ruchang_animation_by_resource_id(ruchang_resource_id);
        text_animations.push(ruchang_ani)
    }
    if(chuchang_resource_id){
        let chuchang_ani = find_chuchang_animation_by_resource_id(chuchang_resource_id);
        text_animations.push(chuchang_ani)
    }
    if(xuhuan_resource_id){
        let loop_ani = find_xunhuan_animation_by_resource_id(xuhuan_resource_id);
        text_animations.push(loop_ani)
    }
    let animations =  {
        "animations": text_animations,
        "id": uuidv4(),
        "multi_language_current": "none",
        "type": "sticker_animation"
    };
    draft_content.materials.material_animations.push(animations);
    return animations
}




module.exports = { add_text_animations };
