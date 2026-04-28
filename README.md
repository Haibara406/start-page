# Start Page

这个目录现在分成两部分：

- `legacy-build/`：原始拷贝下来的编译产物，作为参考保留，不进入 git
- `index.html` + `assets/`：当前可维护的静态版 start page

## 当前实现

- 搜索引擎切换
- 本地时间显示
- 本地书签管理
- 拖拽排序
- 主题 / 配色 / 背景 / 网格 / 模糊设置
- 书签导入导出与本地重置

## 目录结构

```text
.
├── assets
│   ├── css
│   │   └── main.css
│   └── js
│       ├── app.js
│       ├── config.js
│       └── storage.js
├── index.html
└── legacy-build
```

## 使用方式

直接打开 `index.html` 即可。

## 发布

- `npm run build` 会生成 `dist/`
- GitHub Actions 会自动把 `dist/` 部署到 GitHub Pages
- 自定义域名通过仓库根目录的 `CNAME` 文件配置为 `homepage.haikari.top`
