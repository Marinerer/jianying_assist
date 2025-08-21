const path = require('path');
const os = require('os');
const ffmpeg = require('fluent-ffmpeg');

function setFfmpegPaths(resourcesPath, isPackaged) {
    let ffmpegPath;
    let ffprobePath;

    switch (os.platform()) {
        case 'win32':
            // Windows
            if(isPackaged) {
                ffmpegPath = path.join(resourcesPath, 'app.asar.unpacked', 'ffmpeg/win/ffmpeg.exe');
                ffprobePath = path.join(resourcesPath, 'app.asar.unpacked', 'ffmpeg/win/ffprobe.exe');
            } else {
                ffmpegPath = path.join(__dirname, '../../../ffmpeg/win/ffmpeg.exe');
                ffprobePath = path.join(__dirname, '../../../ffmpeg/win/ffprobe.exe');    
            }
            break;

        case 'darwin':
            // MacOS
            if(isPackaged) {
                ffmpegPath = path.join(resourcesPath, 'app.asar.unpacked', 'ffmpeg/mac/ffmpeg');
                ffprobePath = path.join(resourcesPath, 'app.asar.unpacked', 'ffmpeg/mac/ffprobe');
            } else {
                ffmpegPath = path.join(__dirname, '../../../ffmpeg/mac/ffmpeg');
                ffprobePath = path.join(__dirname, '../../../ffmpeg/mac/ffprobe');    
            }
            break;

        default:
            throw new Error('Unsupported platform: ' + os.platform());
    }

    ffmpeg.setFfmpegPath(ffmpegPath);
    ffmpeg.setFfprobePath(ffprobePath);
}

module.exports = { setFfmpegPaths };
