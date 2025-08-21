const path = require('path');
const os = require('os');
const fs = require('fs');
const crypto = require('crypto');
const fsex = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const { add_audio } = require('./add_audio');
const { add_video } = require('./add_video');
const { app } = require('electron');
const { add_text } = require('./add_text');
const {getImageDimensions} = require('./get_image_info');
const { add_new_tracks } = require('./add_tracks');
const { add_new_segments } = require('./add_tracks_segments');
const { getVideoResolution,getVideoDuration,getAudioDuration } = require("../video/ffmpegHandler");
const { add_text_animations } = require('./add_text_animations');
const { add_video_animations } = require('./add_video_animations');
const { add_video_effects } = require('./add_video_effects');

//创建草稿
//创建新的草稿，并返回草稿路径
async function create_draft_file(draft_path,draft_name) {
    
    draft_path = path.join(draft_path,draft_name)
    if (!fs.existsSync(draft_path)) {
      fs.mkdirSync(draft_path, { recursive: true });
    }
    
    if( app && app.isPackaged){
      tmp_path_name = path.join(process.resourcesPath, 'app.asar.unpacked', 'jianyin/template');
      await copyDirectory(tmp_path_name,draft_path)
    }else{
      await copyDirectory(path.join(__dirname, '../../../jianyin/template'), draft_path);
    }
    
    console.log('创建模版：',draft_path)

    //修改名字
    let draft_json  =  await get_draft_json(draft_path,1)
    draft_json.draft_fold_path = draft_path;
    draft_json.draft_root_path = draft_path;
    draft_json.draft_name = draft_name;
    save_draft_json(draft_path,draft_json,1)

    //修改ID
    let template = readJsonFile( path.join( draft_path, "template.tmp"));
    template.id = uuidv4();
    writeJsonFile(path.join( draft_path, "template.tmp"), template);
    


    return draft_path
  
}
//复制模版
async function copyDirectory (srcDir, destDir) {
    try {
      await fsex.copy(srcDir, destDir);
      console.log('Directory has been copied successfully');
    } catch (err) {
      console.error(err);
    }
  }


  function readJsonFile (filePath) {
    try {
      const data = fs.readFileSync(filePath, 'utf-8');
      const json = JSON.parse(data);
      // console.log(`JSON data:`, json);
      return json;
    } catch (err) {
      console.error(`Error reading or parsing file: ${err}`);
    }
  }
  
  function writeJsonFile (filePath, json) {
    console.log(filePath, 'filePath');
    try {
      const data = JSON.stringify(json, null, 0);
      fs.writeFileSync(filePath, data, 'utf-8');
      console.log(`JSON data has been written to ${filePath}`);
    } catch (err) {
      console.error(`Error writing file: ${err}`);
    }
  }
  


//通过草稿路径获取json编辑文件
async function get_draft_json(draft_path,is_meta=0){
    let json_path = path.join( draft_path, "draft_content.json");
    if(is_meta){
        json_path = path.join( draft_path, "draft_meta_info.json");
    }

    let meta_info = readJsonFile(json_path);
    // console.log(meta_info)
    return meta_info

}

//通过草稿路径写入草稿内容
async function save_draft_json(draft_path,draft_content,is_meta=0){
    let json_path = path.join( draft_path, "draft_content.json");
    if(is_meta){
        json_path = path.join( draft_path, "draft_meta_info.json");
    }
    writeJsonFile( json_path ,  draft_content);
    return get_draft_json(draft_path)

}



async function test_add_image(){

    //剪映路径
    let draft_path = '/Users/hxc/draw_img/default_jianyin_draft/draft/JianyingPro Drafts';
    draft_path = await create_draft_file(draft_path,'ts-'+new Date().getTime())
    //获取内容
    let draft_content =  await get_draft_json(draft_path)
    

    //增加图片案例
    let image_path  = '/Users/hxc/Downloads/图片/henbign.png';
    let image_info = await  getImageDimensions(image_path);
    let image = await  add_video(draft_content,image_path,5*1000000,image_info.width,image_info.height,0);
    let image_track =  await add_new_tracks(draft_content,'video')
    //轨道上增加媒体
    await add_new_segments(image_track,image.id,0,5*1000000);
     let seg01 =  await add_new_segments(image_track,image.id,5*1000000,10*1000000);
    //增加动画
    let v_ani01 =  await add_video_animations(draft_content,'6991764455931515422','6798320902548230669','7025952723027628557');
    seg01.extra_material_refs.push(v_ani01.id)


    

    //增加视频案例
    let video_path  = '/Users/hxc/Downloads/solo.mp4'
    let video_duration =  await getVideoDuration(video_path)
    let video_info =  await getVideoResolution(video_path);
    let video_01 = await  add_video(draft_content,video_path,video_duration*1000000,video_info.width,video_info.height,1);
    //增加一条轨道
    let video_track =  await add_new_tracks(draft_content,'video')
    await add_new_segments(video_track,video_01.id , 15*1000000,video_duration*1000000)


    //增加音频案例
    let audio_path = '/Users/hxc/draw_img/0/mp3/0-1716193641286.wav'
    let audio_duration = await getAudioDuration(audio_path);
    let audio_01 =  await add_audio(draft_content,audio_path,audio_duration*1000000)
    //增加一条音频轨道
    let audio_track =  await add_new_tracks(draft_content,'audio');
    await add_new_segments(audio_track,audio_01.id,0,audio_duration*1000000);


    //增加字幕
    let content = "不要轻易相信任何人"
    let text_01 =  await add_text(draft_content,content);
    //增加一个字幕轨道
    let text_track =  await add_new_tracks(draft_content,'text')

    //增加一个入场动画
    let animations01 =  await add_text_animations(draft_content,'6724916044072227332','7244102414377161276','6908592686781960717')
    let text_seg01 = await add_new_segments(text_track,text_01.id,0,5*1000000);
    text_seg01.extra_material_refs.push(animations01.id)


    //新增一个特效轨道
    let texiao_track = await add_new_tracks(draft_content,'effect')
    let effect01 =  await add_video_effects(draft_content,'7345724656642429452')
    let texiao_seg01 = await add_new_segments(texiao_track,effect01.id,0,5*1000000);


    save_draft_json(draft_path,draft_content)

}





// test_add_image()


module.exports = { create_draft_file,get_draft_json,save_draft_json };
