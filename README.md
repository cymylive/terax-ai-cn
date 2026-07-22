<div align="center">
  <img src="terax-icon.png" width="144" height="144" alt="Terax" />
  <h1>Terax 中文精简版</h1>

  <p><strong>轻量级跨平台终端 + 代码编辑器</strong></p>

  <p>
    <img src="https://img.shields.io/badge/版本-0.6.6--cn--patch16-blue" alt="版本" />
    <img src="https://img.shields.io/badge/协议-Apache--2.0-green" alt="协议" />
    <img src="https://img.shields.io/badge/平台-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey" alt="平台" />
  </p>
</div>

---

> **声明**：本项目基于 [Terax](https://github.com/crynta/terax-ai)（原作者 [Crynta](https://github.com/crynta)）进行精简定制，移除了 AI 和网页预览模块，仅保留终端 + 编辑器 + 项目文件树核心功能。遵循 Apache License 2.0 协议。

## 📦 下载

通过 GitHub Actions 自动构建 **Windows 安装包**，请在 [Actions](https://github.com/cymylive/terax-ai-cn/actions) 页面选择最新成功构建，在 Artifacts 中下载 `Terax-Windows.zip`。

## 🚀 功能特性

### 🖥️ 终端

- xterm.js + WebGL 渲染器，多标签支持后台运行
- 原生 PTY 后端（支持 zsh、bash、pwsh、cmd、fish）
- **分屏面板** — 水平/垂直拆分终端（最多 4 个面板）
- 内联搜索、链接检测、真彩色支持
- Shell 集成（OSC 7 目录报告、OSC 133 提示符标记）
- 文件拖放 — 从资源管理器拖入文件，自动写入完整路径
- 空闲标签卸载 — 非活跃终端标签不渲染，节省内存

### 📝 代码编辑器

- CodeMirror 6，支持 TS/JS、Rust、Python、HTML/CSS、JSON、Markdown
- Vim 模式
- 预置 9 种主题（Tokyo Night、Nord、GitHub Dark/Light 等）
- 双击标签可重命名

### 📁 项目文件树

- 点击「选择文件夹」打开原生对话框选择项目目录
- 递归浏览目录结构，懒加载子目录
- 双击文件在编辑器打开

### 🔧 系统托盘

- **关闭到托盘** — 点击 × 最小化到系统托盘而非退出
- 左键点击托盘图标切换窗口显示/隐藏
- 右键托盘菜单：显示窗口 / 退出

### 🌍 国际化

- 简体中文 / English 一键切换（设置 → 通用 → 语言）

### 📋 其他

- 约 **7 MB** 打包体积
- 自动恢复窗口位置和大小
- 开机自启动（设置中开启）
- 快捷键自定义（设置 → 快捷键）
- 无遥测，无需账号

## ⌨️ 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+T` | 新建终端标签 |
| `Ctrl+R` | 新建隐私终端标签 |
| `Ctrl+E` | 新建编辑器标签 |
| `Ctrl+W` | 关闭当前标签/面板 |
| `Ctrl+Tab` / `Ctrl+Shift+Tab` | 切换标签 |
| `Ctrl+F` | 在终端中搜索 |
| `Ctrl+Shift+F` | 文件搜索 |
| `Ctrl+D` | 水平拆分终端 |
| `Ctrl+Shift+D` | 垂直拆分终端 |
| `Ctrl+B` | 切换侧边栏 |
| `Ctrl+,` | 打开设置 |

> 所有快捷键可在 **设置 → 快捷键** 中自定义。

## 🔨 从源码构建

### 前置要求

- Rust（stable）— [rustup.rs](https://rustup.rs)
- **Node.js 20+** + **[pnpm](https://pnpm.io)**
- Visual Studio Build Tools（Windows，含 MSVC v143 + Windows SDK）

### 构建

```bash
pnpm install
pnpm tauri build
```

### 代码检查

```bash
pnpm exec tsc --noEmit
```

## 🏗️ 技术栈

| 层 | 技术 |
|----|------|
| 桌面壳 | Tauri 2 |
| 后端 | Rust（portable-pty, keyring） |
| 前端 | React 19 + TypeScript + Vite 7 |
| 终端 | xterm.js + WebGL |
| 编辑器 | CodeMirror 6 |
| 国际化 | i18next + react-i18next |
| 样式 | Tailwind v4 + shadcn/ui |
| 状态管理 | Zustand |

## 🗺️ 项目结构

```
src/
├── app/                    # 主应用组件
├── components/             # 通用 UI 组件（shadcn/ui）
├── i18n/                   # 国际化 (中/英)
├── lib/                    # 工具函数
├── modules/
│   ├── editor/             # CodeMirror 编辑器
│   ├── header/             # 顶部标题栏 + 标签栏
│   ├── project-tree/       # 项目文件树
│   ├── settings/           # 设置管理
│   ├── shortcuts/          # 快捷键系统
│   ├── statusbar/          # 底部状态栏
│   ├── tabs/               # 标签管理
│   ├── terminal/           # 终端 (xterm.js + PTY)
│   ├── theme/              # 主题系统
│   └── workspace/          # 工作区环境 (WSL)
├── settings/               # 设置页面
└── styles/                 # 全局样式

src-tauri/
├── src/
│   ├── modules/
│   │   ├── fs/             # 文件系统操作
│   │   ├── pty/            # PTY 终端
│   │   ├── shell/          # Shell 命令
│   │   └── workspace/      # WSL 工作区
│   └── lib.rs              # Tauri 应用入口
├── capabilities/           # 权限配置
└── tauri.conf.json         # Tauri 配置
```

## 📄 许可证

Apache License 2.0

## 🙏 致谢

- 原项目：[terax-ai](https://github.com/crynta/terax-ai)
- 原作者：[Crynta](https://github.com/crynta)
