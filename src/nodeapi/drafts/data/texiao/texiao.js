const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * 读取当前目录下所有的 .json 文件并返回其内容的数组
 * @returns {Promise<Array<Object>>} 包含所有 JSON 文件内容的数组
 */
async function readAllJsonFiles() {
    try {
        // 获取当前脚本目录路径
        const directoryPath = __dirname;

        // 读取目录内容
        const files = await fs.readdir(directoryPath);

        // 过滤出 .json 文件
        const jsonFiles = files.filter(file => path.extname(file).toLowerCase() === '.json');

        // 创建一个读取 JSON 文件的 Promise 数组
        const readPromises = jsonFiles.map(async (file) => {
            const filePath = path.join(directoryPath, file);

            // 异步读取 JSON 文件
            const data = await fs.readFile(filePath, 'utf8');
            return JSON.parse(data);
        });

        // 等待所有 JSON 文件读取完成并返回内容数组
        return await Promise.all(readPromises);
    } catch (err) {
        console.error("Error reading JSON files:", err);
        throw err;
    }
}

//mode = 0 非vip  mode = 1 vip  mode = 2 all 
async function get_all_texiao_Effects(mode=0){

    let vip_effects = []
    let effects = []
    const contents = await readAllJsonFiles();
    for (let content of contents) {

        let tmp_effects = content.data.CategoryEffects.Effects;

        for (let effect of tmp_effects) {
            let adjust_params = []
            if(effect.SdkExtra){
                adjust_params = JSON.parse(effect.SdkExtra).setting.effect_adjust_params
            }
            let tmp = {
                "adjust_params": adjust_params,
                "algorithm_artifact_path": "",
                "apply_target_type": 2,
                "apply_time_range": null,
                "category_id": "",
                "category_name": "",
                "common_keyframes": [],
                "disable_effect_faces": [],
                "effect_id": effect.EffectId,
                "formula_id": "",
                "id": uuidv4(),
                "name": effect.Name,
                "path": "",
                "platform": "all",
                "render_index": 0,
                "request_id": "",
                "resource_id": effect.ResourceId,
                "source_platform": 0,
                "time_range": null,
                "track_render_index": 0,
                "type": "video_effect",
                "value": 1.0,
                "version": "",
                "icon_url":effect.IconUrl.UrlList[0]
            }

            let extra = JSON.parse(effect.Extra)
            if (extra.is_vip) {
                tmp.is_vip = 1
                vip_effects.push(tmp)
            } else {
                tmp.is_vip = 0
                effects.push(tmp)
            }

        }

    }

    if(mode==0 ){
        return effects
    }else if(mode == 1){
        return vip_effects
    }else{
        return [...vip_effects,...effects]
    }
}

async function find_texiao_animation_by_resource_id(resource_id){
    let effects = await get_all_texiao_Effects(2);
    for(let info of effects){
        if(info.resource_id == resource_id){
            return info
        }
    }
    return null

}



// (async () => {
//     try {
//         const contents = await find_texiao_animation_by_resource_id('7348707427165934107')
//         console.log(" contents:", contents);
//     } catch (err) {
//         console.error(err);
//     }
// })();


module.exports = { get_all_texiao_Effects , find_texiao_animation_by_resource_id };