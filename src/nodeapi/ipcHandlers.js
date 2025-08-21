const { app, ipcMain, dialog, shell, session, BrowserWindow, screen } = require('electron');
const path = require('path');
const fs = require('fs');

const { jitangHandler } = require('./jitang/jitangHandler');
const { animeHandler } = require('./anime/animeHandler');
const { downloadDraft } = require('./jitang/download');

console.log(process.versions.electron);
console.log(process.versions.chrome);

function setupIpcHandlers () {
  ipcMain.on('message-from-renderer', (event, message) => {
    console.log(message); // 输出 'Hello from renderer process'
  });

  ipcMain.handle('request-data', async (event, data) => {
    console.log(data); // 输出 'some data'
    return 'response from main process';
  });

  ipcMain.handle('get-app-version', () => {
    return app.getVersion();
  })

  ipcMain.handle('open-directory-dialog', async (event) => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    });
    return result;
  });

  ipcMain.handle('open-file-path', async (event, base_path) => {
    console.log(base_path);
    if (base_path.startsWith('file://')) {
      base_path = base_path.slice(7); // 去掉 'file://'
    }
    const questionMarkIndex = base_path.indexOf('?');
    if (questionMarkIndex !== -1) {
      base_path = base_path.slice(0, questionMarkIndex); // 去掉 '?' 及其后面的内容
    }

    shell.showItemInFolder(base_path);
  });

  ipcMain.handle('open-url', (event, url) => {
    shell.openExternal(url);
  });

  ipcMain.handle('download-json-and-resources', async (event, data) => downloadDraft(event, data))

  ipcMain.handle('open-shell-python', async (event, data) => autoScene(event, data))

  ipcMain.handle('jitang-task-export-jianyin', async (event, data) => jitangHandler(event, data));

  ipcMain.handle('anime-task-export-jianyin', async (event, data) => animeHandler(event, data));

  ipcMain.on('open-url', async (event, space) => {
    const { title, url, hash } = space;
    // console.log(space)


    // Create a unique session for each space
    const spaceSession = session.fromPartition(`persist:${hash}`);

    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;

    // Load cookies for this space
    await loadCookiesForSession(spaceSession, space);

    // Create a new BrowserWindow with the unique session
    const win = new BrowserWindow({
      width: width,
      height: height,
      webPreferences: {
        session: spaceSession,
        contextIsolation: true,
        enableRemoteModule: true,
        webSecurity: false,
        nodeIntegration: false,
      },
    });

    win.loadURL(url);

    // Optionally, add logic to clear data or cookies for this session if needed

    // Record browsing history
    recordHistory({ title, url, hash });
  });


  // initPluginHandler(ipcMain);
}

async function loadCookiesForSession (mySession, space) {
  if (space.cookies) {
    for (let cookie of space.cookies) {

      try {

        if (!cookie.url) {
          cookie.url = space.url;
        }
        if (!cookie.expirationDate) {
          cookie.expirationDate = parseInt(new Date().getTime() / 1000) + 30 * 24 * 60 * 60
        }
        // console.log(cookie)
        await mySession.cookies.set(cookie);

      } catch (error) {
        console.log(error)

      }



    }
  } else {
    console.log('No cookies found for this session.');
  }
}

function recordHistory (space) {
  const historyPath = path.join(app.getPath('userData'), 'browsing-history.json');
  let history = [];

  // Read existing history
  if (fs.existsSync(historyPath)) {
    history = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
  }

  // Add new record
  history.push(space);

  // Write updated history
  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2), 'utf-8');
}

module.exports = { setupIpcHandlers };