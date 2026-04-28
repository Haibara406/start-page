# Start Page

这个目录现在分成两部分：

- `legacy-build/`：原始拷贝下来的编译产物，作为参考保留，不进入 git
- `app/` + `components/` + `lib/`：当前可维护的 Next.js / React 版本
- `index.html` + `assets/`：上一版静态实现，保留作参考

## 当前实现

- 搜索引擎切换
- 本地时间显示
- 本地书签管理
- 拖拽排序
- 主题 / 配色 / 背景 / 网格 / 模糊设置
- 书签导入导出与本地重置
- NaviR 同款 GSAP 背景入场、SplitType 背景文字、World Map 资源

## 目录结构

```text
.
├── app
│   ├── globals.css
│   ├── layout.jsx
│   └── page.jsx
├── components
│   ├── AppShell.jsx
│   ├── BackgroundEffects.jsx
│   └── icons.jsx
├── lib
│   └── config.js
├── public
│   ├── Oxanium_VariableFont_wght.ttf
│   ├── World Map.svg
│   └── favicon.ico
└── legacy-build
```

## 使用方式

```bash
npm install
npm run dev
```

开发地址默认是 `http://localhost:3000`。

## 发布

- `npm run build` 会生成 `dist/`
- `npm start` 会用本地静态服务器预览 `dist/`
- GitHub Actions 会自动把 `dist/` 部署到 GitHub Pages
- 自定义域名通过仓库根目录的 `CNAME` 文件配置为 `homepage.haikari.top`
