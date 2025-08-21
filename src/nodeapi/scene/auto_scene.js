const { app, BrowserWindow, ipcMain } = require('electron');
const { exec } = require('child_process');
const path = require('path');

async function autoScene(event, data) {


    const command = '/Users/hxc/translate_web/translate_web/conda/scene/pys/bin/python /Users/hxc/translate_web/translate_web/conda/scene/main.py'; // 在激活虚拟环境后执行 python -V

    // 在不同平台上使用不同的命令打开终端
    if (process.platform === 'win32') {
        exec(`start cmd.exe /K "${command}"`);
    } else if (process.platform === 'darwin') {
        exec(`osascript -e 'tell application "Terminal" to do script "${command}"'`);
    } else if (process.platform === 'linux') {
        exec(`gnome-terminal -- bash -c "${command}; exec bash"`);
    }

}

// testData()

module.exports = { autoScene };
