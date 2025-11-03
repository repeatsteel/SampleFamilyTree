FamilyTree4 项目说明（简明版）

概述
- 渲染与交互浏览家族树数据（Data/FamilyDB.js），前端资源位于 js、css、lib 等目录。
- 集成 Hexo（hexo_site/）用于生成“家族故事”静态页面，主站通过 iframe 加载。
- 推荐发布到 GitHub Pages（main/docs）。

站点管理脚本（PowerShell）
- 脚本：scripts/site_manage.ps1（推荐使用，整合构建/复制/打包）
- 常用子命令：
  - release [zipName] [relative|absolute|docs]：一键发布（clean + build + package），默认 PathMode=relative，zipName 可省略（自动 site_YYYYMMDD_HHmm.zip）。
  - build [relative|absolute|docs]：全站构建（默认 PathMode=docs），复制基础资源、成员数据、树模块，生成并复制 Hexo 页面，修补 iframe。
  - clean：清理 docs/ 与 hexo_site/public、db.json。
  - stories：仅生成 Hexo（npx hexo generate）。
  - basic：复制 index/css/精选lib/fonts 到 docs。（lib 仅包含站点必需文件：familytree.js、tailwindcss.min.js、font-awesome.min.css）docs/。
  - members：复制 Data 与 js/members_db.js 到 docs/。
  - tree：复制 js/app.js 到 docs/。
  - prepare：仅复制 Hexo 输出到 docs/hexo_site/public，并创建 .nojekyll（不复制其它模块）。
  - package [zipName]：打包 docs/ 为 zip（默认 site_YYYYMMDD_HHmm.zip）。
  - profile <组合> [relative|absolute|docs]：按组合构建，支持：
    members+tree、basic+members+tree、stories+basic、basic+members、members+stories、basic+stories+tree、all。
- PathMode 说明：
  - relative（推荐）：iframe 指向 hexo_site/public/index.html（相对路径），适合离线 file:// 访问与 GitHub Pages。
  - absolute：iframe 指向 /hexo_site/public/index.html（绝对路径）。
  - docs：iframe 指向 /docs/index.html（主要用于本地预览；GitHub Pages 根为 docs/ 内容，远端不建议）。

常用工作流示例
- 一键发布（默认 relative，生成 zip 包到项目根）：
  .\scripts\site_manage.ps1 release
  .\scripts\site_manage.ps1 release site_package.zip relative
- 全站构建（默认 docs）：
  .\scripts\site_manage.ps1 build
- 组合构建（全量与路径模式）：
  .\scripts\site_manage.ps1 profile all docs
  .\scripts\site_manage.ps1 profile all relative
- 仅准备 Hexo 输出：
  .\scripts\site_manage.ps1 prepare
- 打包发布产物：
  .\scripts\site_manage.ps1 package

本地预览与离线访问
- 本地 HTTP 预览（推荐）：
  - 在项目根启动：python -m http.server 8000 或 npx http-server -p 8000
  - 访问：
    - 主站整合页面： http://localhost:8000/docs/index.html
    - 家族故事（Hexo）： http://localhost:8000/hexo_site/public/index.html
  - 提示：请仅保留一个本地服务器监听 8000 端口，避免冲突。
- 离线 file:// 方式：
  - 已启用 hexo_site/_config.yml 的 relative_link: true，构建出的页面更兼容离线访问。
  - 直接解压 release 生成的 zip 后使用 file:// 打开 docs/index.html；部分浏览器对 file:// 的跨源与预加载策略较严格，如遇字体/脚本阻止，可改用本地 HTTP 预览。

Hexo 集成与迁移
- 位置：hexo_site/ 为 Hexo 项目根；迁移脚本：hexo_site/scripts/migrate_stories_to_hexo.js。
- 已配置 relative_link: true（hexo_site/_config.yml），生成相对链接，提升离线 file:// 与 GitHub Pages 兼容性。
- 数据说明：旧版 stories.json 已弃用，当前主站仅通过 iframe 加载 Hexo 页面；如继续使用迁移脚本，请保留 Data/stories.json，否则可删除。
- 代码清理：已移除旧版 JSON 渲染函数（loadStoriesData / renderStoriesList / showStoryDetail），stories 区块完全由 Hexo 页面提供。
- 挂载容器：主站在 #stories 下提供固定挂载点 #hexoMount，renderStories 在运行时注入 iframe；如需调整布局可改容器样式或 ID。
- Markdown 渲染：主站不再使用 lib/marked.min.js（已从构建移除），Markdown 渲染由 Hexo 子站负责（依赖 hexo-renderer-marked）。
- 迁移示例（如需从 JSON 更新到 Markdown）：
  node .\hexo_site\scripts\migrate_stories_to_hexo.js
  然后在 hexo_site 目录执行：npx hexo generate

GitHub Pages（main/docs）
- 设置：仓库 Settings -> Pages -> Source 选择 main 分支 /docs 目录。
- 推荐使用 PathMode=relative 或 absolute（iframe 指向 hexo_site/public/index.html）；原因：GitHub Pages 的站点根为 docs 内容，/docs/index.html 在远端不生效；本地预览时 PathMode=docs 可用。
- prepare 会创建 .nojekyll，避免 Jekyll 干预静态资源。

GitHub Pages 部署步骤（详细）
1) 构建站点（推荐在本地预览通过后再发布）
   - 全量构建并设定路径模式（推荐 relative 或 absolute）：
     .\scripts\site_manage.ps1 profile all relative
     或
     .\scripts\site_manage.ps1 build relative
   - 本地预览（仅保留一个 8000 端口服务）：
     python -m http.server 8000
     打开 http://localhost:8000/docs/index.html 验证页面与 iframe 加载。

2) 检查 docs/ 目录结构（发布内容）
   - 关键文件/目录应存在：
     docs/index.html、docs/css/、docs/js/、docs/fonts/、docs/lib/、docs/hexo_site/public/、docs/.nojekyll

3) 配置或确认远程仓库（建议使用 SSH）
   - 示例：
     git remote -v
     若未配置：
     git remote add origin git@github.com:<你的用户名>/FamilyTree4.git
     测试 SSH：
     ssh -T git@github.com

4) 提交并推送到 main 分支
   - 提交发布内容：
     git add docs
     git commit -m "Publish site (docs)"
     git push origin main

5) 开启 GitHub Pages
   - 仓库 Settings -> Pages -> Source 选择 main 分支 /docs 目录。
   - 保存后等待 GitHub Pages 构建完成（数十秒至数分钟）。

6) 访问与验证
   - 站点根（对应 docs/ 内容）：
     https://<你的用户名>.github.io/FamilyTree4/
   - 家族故事（Hexo 生成）：
     https://<你的用户名>.github.io/FamilyTree4/hexo_site/public/
   - 若 iframe 无法加载或路径异常：
     - 将 PathMode 切换为 relative 或 absolute 并重新构建；
     - 确认 docs/hexo_site/public/ 已随构建复制；
     - 确认 .nojekyll 存在，避免资源路径被 Jekyll 改写。

7) 常见发布问题排查
   - 404/资源加载失败：检查路径是否以 / 开头（absolute）或为相对路径（relative）并与实际目录匹配。
   - 中文输出在 PowerShell 5 控制台乱码：执行 chcp 65001 或使用 PowerShell 7。
   - Pages 未发布或失败：查看仓库 Actions/Pages 日志，确认 docs/ 目录已推送。

项目管理脚本（可选旧流程）
- 脚本：scripts/project_manage.ps1（主要用于 Hexo 清理/生成/准备/部署）。
- 如采用 site_manage.ps1，一般无需使用 deploy，仅本地预览与打包即可。

常见问题与提示
- PowerShell 5 中文帮助可能出现乱码：
  - 方案：在终端执行 chcp 65001，或使用 PowerShell 7；确保控制台字体支持中文。
- Tailwind 提示：lib/tailwindcss.min.js 提示 CDN 不建议用于生产，当前为本地预览无影响；生产建议使用 CLI/PostCSS 构建。
- 依赖：确保 Node.js（npx 可用），若 Hexo 依赖缺失，请在 hexo_site 下执行 npm install。

版本记录（简要）
- 2025-10-27：新增 site_manage.ps1，支持全站构建、组合 profile、时间戳打包，默认 PathMode=docs。
- 2025-10-25：修复滚轮缩放与拖拽抖动，加入日志控制器，完善回退交互与容错。

## 一键构建并发布（示例脚本）
- PowerShell：已提供脚本 scripts/publish.ps1
  - 用法：
    - `./scripts/publish.ps1` 默认为 PathMode=relative，并执行推送（git add/commit/push 到 origin main）
    - `./scripts/publish.ps1 docs` 使用 docs 模式构建并推送
    - `./scripts/publish.ps1 absolute` 使用 absolute 模式构建并推送
  - 注意：该脚本会直接推送到 origin main，请在执行前确认当前仓库的远程与分支设置正确。
- 或使用站点管理脚本：
  - `./scripts/site_manage.ps1 deploy [relative|absolute|docs] [push]`
    - 不带 push 仅构建，不推送
    - 带 push 将执行 git add/commit/push
  - 一键发布并打包（默认 PathMode=relative）：
    - `./scripts/site_manage.ps1 release`
    - `./scripts/site_manage.ps1 release site_package.zip relative`