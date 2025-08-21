const {  shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { create_draft_file, save_draft_json, get_draft_json } = require("../drafts/drafts_task");
const { getAudioDuration } = require("../video/ffmpegHandler");
const {downloadItem} = require('./download')
const { jianyin_export_task } = require('./jianyin_export')
const { rad_text_animations , rad_video_animations , rad_texiao_animations } = require('./rad_animations')
const { getImageDimensions } = require("../drafts/get_image_info");



async function jitangHandler(event,data) {
    
    console.log(data);
    

    //获取软件根目录地址
    let jianyin_path = data.jianyin_path;

    

    let draft_name = data.title+'-'+new Date().getTime();
    let draft_path = await create_draft_file(jianyin_path,draft_name);

    let resource_data = 'resource_data'
    let resource_data_path =  path.join(jianyin_path,draft_name,resource_data)

    if (!fs.existsSync(resource_data_path)) {
        fs.mkdirSync(resource_data_path, { recursive: true });
      }

    console.log(resource_data_path)
    let details =[];
    let start = 0
    let batchDetails = data.data
    for(let tmp of batchDetails){
        let  detail = {}
        //读取内容
        detail.subtitle_content = tmp.value

        for(let info of   tmp.result){
            
            if(info.title.indexOf('音频')>-1 && info.value ){
                let tmp_file_name = `${uuidv4()}.mp3`
                let filePath = path.join(resource_data_path,tmp_file_name)

                await downloadItem(info.value,filePath)
                info.local_path = filePath
                detail.duration = await getAudioDuration(filePath);
                detail.mp3_url = `##_draftpath_placeholder_0E685133-18CE-45ED-8CB8-2904A212EC80_##/${resource_data}/${tmp_file_name}` ;
                
                detail.subtitle_start = start
                start += detail.duration
            }

            if(info.title.indexOf('图片')>-1 && info.value){
                let tmp_file_name = `${uuidv4()}.png`
                let filePath = path.join(resource_data_path,tmp_file_name)
                await downloadItem(info.value,filePath)
                info.local_path = filePath
                let image_info = await getImageDimensions(filePath);
                detail.img_width = image_info.width;
                detail.img_height = image_info.height;
                detail.img_url = `##_draftpath_placeholder_0E685133-18CE-45ED-8CB8-2904A212EC80_##/${resource_data}/${tmp_file_name}` ;;
            }
            if(info.title.indexOf('关键词')>-1){
                detail.key_words = info.value
            }
            console.log('下载完成：',info)

        }

        //增加动画
        let res =  await rad_text_animations('in')
        detail.tx_in_ani_res_id = res.resource_id
        res =  await rad_text_animations('out')
        detail.tx_out_ani_res_id = res.resource_id
        detail.tx_loop_ani_res_id = ""
        res =  await rad_video_animations('in')
        detail.im_in_ani_res_id = res.resource_id
        res =  await rad_video_animations('out')
        detail.im_out_ani_res_id = res.resource_id
        detail.im_loop_ani_res_id = ""
        res =  await rad_texiao_animations()
        // detail.effects_resource_id = res.resource_id
        detail.effects_resource_id = ''


        details.push(detail);
    }
    
    console.log(details);
    await jianyin_export_task(draft_path, details)

    shell.showItemInFolder(draft_path)

    return ''
  
}

async function testData(){
    let data = {
        jianyin_path: '/Users/hxc/draw_img/default_jianyin_draft/draft/JianyingPro Drafts',
        data: [
        {
            id: 1197,
            user_id: 0,
                 value: '这是一个测试文本',
                 input_value: { value: '这是一个测试文本' },
                 result: [ 
                    {
                        "title":"音频",
                        "value":"https://lf-bot-studio-plugin-resource.coze.cn/obj/bot-studio-platform-plugin-tos/sami/tts/08dc0f5f39c64e179b59fa81e3874be0.mp3"
                    },
                    {
                        "title":"关键词",
                        "value":"测试|文本"
                    },
                    {
                        "title":"图片",
                        "value":"https://lf-bot-studio-plugin-resource.coze.cn/obj/bot-studio-platform-plugin-tos/artist/image/0832b498445646d88902564d6146ac68.png"
                    }
                  ],
                 title: '',
                 collection_id: 'b3c0e49a-1fac-4e26-8380-c6fa6ab05976',
                 collection_detail_id: 'aad5d98e-ab4c-4348-a9de-6e18194c7d99',
                 time: '2024-07-09T14:04:01'
                 
        }
    ]};

    await jitangHandler(undefined,data)
}

// testData();


module.exports = { jitangHandler };
