const { get_all_texiao_Effects } = require("../drafts/data/texiao/texiao");
const { get_all_chuchang_Effects } = require("../drafts/data/text/chuchang");
const { get_all_ruchang_Effects } = require("../drafts/data/text/ruchang");
const { get_all_xunhuanchang_Effects } = require("../drafts/data/text/xunhuan");
const { get_all_group_Effects } = require("../drafts/data/video/group");
const { get_all_ruchang_Effects:get_all_video_in_Effects } = require("../drafts/data/video/ins");
const { get_all_out_Effects } = require("../drafts/data/video/out");



//随机文字动画单个
async function rad_text_animations(text_type,vip_mode=0){
    
    if(text_type == 'in'){
        let all_effs =  await get_all_ruchang_Effects(vip_mode)
        let rad_eff =  all_effs[Math.floor(Math.random() * all_effs.length)];
        return rad_eff
    }else if (text_type == 'out'){
        let all_effs =  await get_all_chuchang_Effects(vip_mode)
        let rad_eff =  all_effs[Math.floor(Math.random() * all_effs.length)];
        return rad_eff
    }else if(text_type == 'loop'){
        let all_effs =  await get_all_xunhuanchang_Effects(vip_mode)
        let rad_eff =  all_effs[Math.floor(Math.random() * all_effs.length)];
        return rad_eff
    }

}
//随机图标动画单个
async function rad_video_animations(text_type,vip_mode = 0 ){

    if(text_type == 'in'){
        let all_effs =  await get_all_video_in_Effects(vip_mode)
        let rad_eff =  all_effs[Math.floor(Math.random() * all_effs.length)];
        return rad_eff
    }else if (text_type == 'out'){
        let all_effs =  await get_all_out_Effects(vip_mode)
        let rad_eff =  all_effs[Math.floor(Math.random() * all_effs.length)];
        return rad_eff
    }else if(text_type == 'loop'){
        let all_effs =  await get_all_group_Effects(vip_mode)
        let rad_eff =  all_effs[Math.floor(Math.random() * all_effs.length)];
        return rad_eff
    }

}


//随机单个特效
async function rad_texiao_animations(vip_mode=0){
    let all_effs =  await get_all_texiao_Effects(vip_mode)
    let rad_eff =  all_effs[Math.floor(Math.random() * all_effs.length)];
    return rad_eff

}

//读取所有动画和特效 texiao  text_in text_out text_loop  video_in video_out video_loop
async function get_all_jianyin_effects(type){
    let data ;
    switch (type) {
        case 'texiao':
            data =  await get_all_texiao_Effects(2)
            break;
        case 'text_in':
            data =  await get_all_ruchang_Effects(2)
            break;
        case 'text_out':
            data = await get_all_chuchang_Effects(2)
            break;
        case 'text_loop':
            data =  await get_all_xunhuanchang_Effects(2)
            break;
        case 'video_in':
            data =  await get_all_video_in_Effects(2)
            break;
        case 'video_out':
            data =  await get_all_out_Effects(2)
            break;
        case 'video_loop':
            data =  await get_all_group_Effects(2)
            break;
    }
    
    return data

}


module.exports = { rad_text_animations , rad_video_animations , rad_texiao_animations , get_all_jianyin_effects};