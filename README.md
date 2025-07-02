# Resume.json + Cloudflare Workers
支持用Cloudflare Workers集成百度搜索的API和Doubao AI API生成Resume.json

整体目标:
- 根据职位描述和公司信息(借助百度搜索API)，结合你的简历内容(存储在Cloudflare D1数据库)，借助Doubao AI API生成Resume.json
- 生成的Resume.json可以直接用JSON Resume命令行工具生成PDF简历

## 运行方法

1. Clone项目
```bash
git clone https://github.com/zhibinyang/smart-resume.git
cd smart-resume
```

2. 安装依赖
```bash
npm install
```

3. 登陆Cloudflare
```bash
npx wrangler login
```

4. 创建D1数据库
```bash
npx wrangler d1 create resume-db
```

5. 将相关配置添加到你的wrangler.jsonc文件里

### 本地运行方法 (本地和云部署二选一)

1. 创建数据表
```bash
npx wrangler d1 execute resume-db --file schema/resumes.sql
npx wrangler d1 execute resume-db --file schema/contents.sql
```

2. 添加你的数据
```bash
npx wrangler d1 execute resume-db --file data/basics.sql
npx wrangler d1 execute resume-db --file data/educations.sql
npx wrangler d1 execute resume-db --file data/projects.sql
npx wrangler d1 execute resume-db --file data/works.sql
```

3. 设置本地环境变量
复制后，注意修改为你的API KEY
```bash
cp .dev.vars.example .dev.vars
```

4. 启动本地服务
```bash
npx wrangler dev --local
```

5. 用API Client发起请求
language支持`en`和`cn` (中文)，默认为`en`
```bash
curl --request POST \
  --url http://localhost:8787/api/generate \
  --header 'content-type: application/json' \
  --data '{
  "text":"<JOB DESCRIPTION>",
  "language": "en"
}'
```

### Cloudflare Workers部署  (本地和云部署二选一)

1. 创建数据表
```bash
npx wrangler d1 execute resume-db --file schema/resumes.sql --remote
npx wrangler d1 execute resume-db --file schema/contents.sql --remote
```

2. 添加你的数据
```bash
npx wrangler d1 execute resume-db --file data/basics.sql --remote
npx wrangler d1 execute resume-db --file data/educations.sql --remote
npx wrangler d1 execute resume-db --file data/projects.sql --remote
npx wrangler d1 execute resume-db --file data/works.sql --remote
```

3. 设置部署环境变量
复制后，注意修改为你的API KEY，会有单独的提示让你输入KEY
```bash
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put BAIDU_API_KEY
```

4. 部署到云
```bash
npx wrangler deploy
```

5. 用API Client发起请求
   language支持`en`和`cn` (中文)，默认为`en`
```bash
curl --request POST \
  --url https://<YOUR_WORKER_URL>/api/generate \
  --header 'content-type: application/json' \
  --data '{
  "text":"<JOB DESCRIPTION>",
  "language": "en"
}'
```

### 下一步

1. 从结果中取出resume对象的部分，保存成resume.json，然后使用JSON Resume命令行生成PDF简历
   JSON Resume的使用可以参考[JSON Resume](https://jsonresume.org/schema/)

2. 关于主题，我自己使用了stackoverflow的主题，需要在jsonresume的项目里安装主题
```bash
npm install jsonresume-theme-stackoverflow
```
所以整体生成简历运行的命令如下
```bash
npx resume export OUTPUT.pdf -t stackoverflow -r INPUT.json
```

3. 关于中文主题，因为stackoverflow主题不支持中文，我又Clone了它的git仓库，针对中文做了修改，你可以先Clone我的仓库
```bash
git clone https://github.com/zhibinyang/jsonresume-theme-stackoverflow-cn.git
```
然后对于生成的中文简历JSON，运行以下命令
```bash
npx resume export OUTPUT.pdf -t ../<PATH_TO_YOUR_jsonresume-theme-stackoverflow-cn>/ -r INPUT.json
```
