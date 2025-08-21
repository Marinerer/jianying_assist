const { app, BrowserWindow } = require('electron');
const path = require('path');
const { setupIpcHandlers } = require('./src/nodeapi/ipcHandlers')

let mainWindow;
let storedDrafId = null;

// 检测是否为开发模式
const isDev = process.env.NODE_ENV === 'development' || 
              process.env.ELECTRON_IS_DEV === 'true' ||
              !app.isPackaged;


app.on('open-url', (event, url) => {
  event.preventDefault();
  console.log('open-url event triggered:', url);
  const urlObj = new URL(url);
  const drafId = urlObj.searchParams.get('drafId');
  console.log(drafId, 'drafId');
  if (drafId) {
    storedDrafId = drafId; // 存储 drafId
    console.log('/batchList');
    // 获取所有窗体并发送消息
    const allWindows = BrowserWindow.getAllWindows();
    allWindows.forEach(win => {
      win.webContents.send('navigate-to-batchList', drafId);
    });
  }
});

app.on('ready', () => {
  console.log('app.on ready');
  createWindow();

  // 设置默认协议客户端
  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient('jianyingAssistant', process.execPath, [path.resolve(process.argv[1])]);
    }
  } else {
    app.setAsDefaultProtocolClient('jianyingAssistant');
  }

  // 监听 batchList-ready 信号
  const { ipcMain } = require('electron');
  ipcMain.on('batchList-ready', (event) => {
    if (storedDrafId) {
      event.sender.send('navigate-to-batchList', storedDrafId);
      storedDrafId = null; // 发送后清除存储的 drafId
    }
  });
});


function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    icon: path.join(__dirname, './assets/icons/logo.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    }
  });
  if (process.platform==='darwin') {
    app.dock.setIcon(path.join(__dirname, './assets/icons/logo.png'))
  }

  // 根据环境加载不同的页面
  if (isDev) {
    // 开发模式：加载webpack-dev-server的地址
    // 延迟3秒等待webpack-dev-server启动
    setTimeout(() => {
      mainWindow.loadURL('http://localhost:8765');
    }, 3000);
    // 开发模式下打开开发者工具
    mainWindow.webContents.openDevTools();
  } else {
    // 生产模式：加载打包后的html文件
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  // 设置 IPC 处理程序
  setupIpcHandlers();

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}


app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});
