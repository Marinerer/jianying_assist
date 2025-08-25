# 剪映助手 (Electron Application)

这是一个基于Electron的剪映助手应用程序，支持本地开发和打包部署。

## 项目结构

```
├── main.js              # Electron主进程入口文件
├── preload.js           # 预加载脚本
├── package.json         # 项目配置和依赖
├── webpack.config.js    # Webpack配置文件
├── .babelrc             # Babel配置文件
├── .gitignore          # Git忽略文件配置
├── assets/             # 应用图标和资源
├── dist/               # 构建输出目录
├── src/                # React应用源代码
├── locales/            # 国际化文件
├── jianyin/            # 剪映模板文件
└── release/            # 打包输出目录
```

## 安装依赖

使用pnpm安装依赖（推荐）：
```bash
pnpm install
```

## 开发模式

启动开发模式，支持热重载：
```bash
pnpm run dev
```

这将：
1. 启动webpack开发服务器（端口9000）
2. 启动Electron应用
3. 自动打开开发者工具

## 构建应用

构建React应用用于生产：
```bash
pnpm run build
```

## 运行生产版本

先构建应用，然后启动Electron：
```bash
pnpm run build
NODE_ENV=production pnpm start
```

## 应用打包

打包应用为可执行文件：

```bash
# 仅打包（不构建dist）
pnpm run pack

# 构建并打包
pnpm run dist
```

打包后的文件将输出到 `release/` 目录。

## 支持平台

- Windows: 生成 .exe 安装程序
- macOS: 生成 .dmg 镜像文件  
- Linux: 生成 .AppImage 文件

## 环境变量

应用会根据以下环境变量判断运行模式：
- `NODE_ENV=development` - 开发模式
- `NODE_ENV=production` - 生产模式
- `ELECTRON_IS_DEV=true` - 强制开发模式

## 主要功能

- 智能视频创作工具
- 支持剪映草稿生成和导出
- AI对话助手功能
- 批量处理工具
- 模板管理系统

## 开发说明

1. 主进程代码在 `main.js` 中，处理窗口创建和系统级功能
2. 渲染进程代码在 `src/` 目录中，使用React构建UI
3. 通过IPC通信实现主进程和渲染进程数据交互
4. 使用webpack进行前端资源构建和热重载

## 故障排除

### Electron启动问题

如果遇到"Electron failed to install correctly"错误：

**方法1：重新安装electron**
```bash
pnpm remove electron
pnpm add -D electron
```

**方法2：启用构建脚本**
```bash
pnpm approve-builds
```
然后选择允许electron运行构建脚本。

**方法3：手动下载electron**
```bash
# 清理缓存
rm -rf node_modules/.cache
pnpm install --force
```

### 端口占用问题

如果遇到端口占用错误，可以：

1. 修改webpack.config.js中的端口号：
```javascript
devServer: {
  port: 8765, // 改为其他端口
}
```

2. 同时修改main.js中对应的URL：
```javascript
mainWindow.loadURL('http://localhost:8765');
```

3. 或者杀死占用端口的进程：
```bash
# Windows
netstat -ano | findstr :8765
taskkill /PID [进程ID] /F

# macOS/Linux  
lsof -ti:8765 | xargs kill -9
```

### 开发模式运行

如果`pnpm run dev`遇到问题，可以分步启动：

1. 先启动webpack开发服务器：
```bash
pnpm run webpack-dev
```

2. 等待编译完成后，在另一个终端启动Electron：
```bash
cross-env ELECTRON_IS_DEV=true electron .
```

### 常见解决方案

```bash
# 完全清理重装
rm -rf node_modules
pnpm install

# 重新构建原生模块
pnpm run postinstall
```

### 创建剪映草稿发生错误
创建剪映草稿时，如果遇到错误，请检查软件安装目录 `resources/app.asar.unpacked/` 下是否存在`jianyin/template/`模板文件。