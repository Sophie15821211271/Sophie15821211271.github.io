# Sophie 的笔记

Astro 静态博客，使用 Pages CMS 编辑文章、媒体和站点设置。

## 本地预览

使用 Node.js 24，运行 `npm install` 和 `npm run dev`。终端会显示预览地址。用 `npm run build` 生成发布文件。

## 首次上线

1. 把项目源码上传到公开仓库 `Sophie15821211271.github.io` 的 `main` 分支，包含 `.github` 和 `.pages.yml`，无需上传依赖目录。
2. 在仓库的 Settings → Pages 中将 Source 设为 GitHub Actions，然后运行 Publish blog 工作流。
3. 使用已有 GitHub 账号登录 https://app.pagescms.org/，授权 Pages CMS 访问博客仓库。
4. 在「站点与个人资料」里上传背景和头像，在「文章」里写笔记。保存后工作流会重新构建网站。

公开仓库中的草稿文件也公开可见。草稿选项仅控制博客是否展示该文章，请将私人笔记留在本地。
## 启用全站访客统计

在 Cloudflare 创建 D1 数据库 `sophie-blog-visits`，将数据库 ID 填入 `visits/wrangler.toml`。在该目录运行 `npx wrangler d1 execute sophie-blog-visits --remote --file=schema.sql` 和 `npx wrangler deploy`。登录 Cloudflare 的步骤在 Wrangler 中完成。把部署返回的 HTTPS 地址填入 Pages CMS 的「访客统计服务地址」或 `src/site.json` 的 `visitsEndpoint`，保存并重新发布。若换了博客域名，同时更新 `SITE_ORIGIN`。

统计按匿名浏览器标签页会话去重，刷新和站内跳转不会重复计数。计数和日历按北京时间归档，不采集访客身份或 IP。未接入服务时只显示空日历。
