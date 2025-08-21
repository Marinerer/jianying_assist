//增加一条轨道
const { v4: uuidv4 } = require('uuid');

//增加一个文字轨道 ,返回内容和轨道ID
// type 值  text  文字
// video 视频
// effect 特效
// audio 音频
// 返回新的草稿内容和轨道ID
async function add_new_tracks(draft_content,type){
    let track = {
        "attribute": 0,
        "flag": 1,
        "id": uuidv4(),
        "segments": [],
        "type": type
    };
    draft_content.tracks.push(track);
    return track
}


module.exports = { add_new_tracks };
