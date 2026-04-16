# Scholar's Tea 部署指南

## 概述

Scholar's Tea（学者茶话会）是一个高校学术交流社区平台，支持课题组管理、学科社区、实时茶话会（Tea Party）和 AI 思想工坊。

---

## 已部署服务

### 技术栈

| 组件 | 版本 | 状态 |
|------|------|------|
| Next.js | 14.x | ✅ 已部署 |
| PostgreSQL | 9.2.24 | ✅ 运行中 |
| Prisma | 5.22.0 | ✅ 已配置 |
| PM2 | 6.0.14 | ✅ 已安装 |
| Node.js | 20.19.6 | ✅ 可用 |

### 数据库

- **数据库名**: `scholars_tea`
- **用户**: `dbuser` / `dbpass123`
- **Socket**: `/data/home/zju321/pgdata/run`
- **表数量**: 29 张

### 已创建的数据库表

```
Account, Citation, College, Comment, Department, Discipline,
GroupDiscipline, GroupMember, Institution, Message, News, Patent,
Post, PostPublication, PostTag, Publication, QuestionVote,
ResearchGroup, ScoreHistory, Session, Tag, TeaPartyRoom,
TeaPartyRoomParticipant, TopQuestion, User, VerificationToken, Vote
```

---

## 项目结构

```
/data/home/zju321/Scholar-s_Tea/
├── src/                    # Next.js 源码
│   ├── app/               # App Router 页面
│   ├── components/        # React 组件
│   ├── lib/              # 工具库
│   └── styles/           # 全局样式
├── prisma/
│   └── schema.prisma      # 数据库模型
├── scripts/
│   └── start-server.sh    # 启动脚本
├── ecosystem.config.js    # PM2 配置
├── package.json
├── .env                   # 环境变量（已配置）
└── node_modules/          # 依赖
```

---

## 启动方法

### 方式一：使用启动脚本（推荐）

```bash
cd /data/home/zju321/Scholar-s_Tea
./scripts/start-server.sh
```

### 方式二：手动启动

```bash
# 1. 启动 PostgreSQL
pg_ctl -D /data/home/zju321/pgdata -l /data/home/zju321/pgdata/logfile start

# 2. 进入项目目录
cd /data/home/zju321/Scholar-s_Tea

# 3. 构建（首次或代码更新后）
npm run build

# 4. 启动应用
pm2 start ecosystem.config.js
pm2 save
```

### 方式三：仅启动应用（PostgreSQL 已运行）

```bash
cd /data/home/zju321/Scholar-s_Tea
pm2 restart scholars-tea
```

---

## PM2 常用命令

```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs scholars-tea

# 重启应用
pm2 restart scholars-tea

# 停止应用
pm2 stop scholars-tea

# 监控（实时）
pm2 monit
```

---

## 访问地址

启动后访问：`http://10.72.212.33:3000`

---

## 配置说明

### 环境变量 (.env)

主要配置项：

```env
DATABASE_URL="postgresql://dbuser:dbpass123@localhost:5432/scholars_tea?host=/data/home/zju321/pgdata/run"
REDIS_URL="redis://localhost:6379"
NEXTAUTH_SECRET="your-secret-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

### 修改环境变量后

```bash
pm2 delete scholars-tea
pm2 start ecosystem.config.js
pm2 save
```

---

## Git 工作流

### 代码更新部署

```bash
# 1. 在本地完成代码修改
git add .
git commit -m "your changes"
git push server develop

# 2. 在服务器上拉取并重启
ssh -i "C:/Users/Mac/.ssh/id_ed25519_scholars_tea" zju321@10.72.212.33
cd /data/home/zju321/Scholar-s_Tea
git pull
pm2 restart scholars-tea
```

### 分支策略

- `develop` - 开发分支，所有功能开发都合并到这里
- 生产部署时 merge 到 main

---

## 数据库操作

### 进入数据库

```bash
psql -h /data/home/zju321/pgdata/run -U dbuser -d scholars_tea
```

### 查看表

```sql
\dt
```

### 查看表结构

```sql
\d "User"
```

### 重置数据库（开发用）

```bash
# 停止应用
pm2 stop scholars-tea

# 删除并重建数据库
dropdb -h /data/home/zju321/pgdata/run -U dbuser scholars_tea
createdb -h /data/home/zju321/pgdata/run -U dbuser scholars_tea

# 同步 schema
npx prisma db push

# 重启应用
pm2 start ecosystem.config.js
```

---

## 功能模块

### 1. 课题组 (Research Groups)
- 课题组主页展示
- 成员管理
- 论文、新闻、专利发布
- AI 总结功能

### 2. 学科社区 (Disciplines)
- 学科树形结构（学科→二级学科→研究方向）
- 讨论帖子
- 跨学科标签系统

### 3. Top Ten Questions
- 每月热门话题投票
- 优质回答高亮
- 问题状态追踪

### 4. Tea Party（实时聊天）
- 公开/私密房间
- 文字聊天
- 聊天记录

### 5. 思想工坊 (AI Workshop)
- 学术 AI 对话
- 论文辅助
- RAG 知识库

---

## 故障排除

### PostgreSQL 无法启动

```bash
# 检查数据目录权限
ls -la /data/home/zju321/pgdata/

# 手动启动并查看日志
pg_ctl -D /data/home/zju321/pgdata -l /data/home/zju321/pgdata/logfile start
cat /data/home/zju321/pgdata/logfile
```

### PM2 应用无法启动

```bash
# 查看详细错误
pm2 logs scholars-tea --err --lines 50

# 检查环境变量
cd /data/home/zju321/Scholar-s_Tea
cat .env
```

### 数据库连接失败

```bash
# 检查 PostgreSQL 是否运行
ps aux | grep postgres

# 检查 socket 目录
ls -la /data/home/zju321/pgdata/run/
```

---

## 服务器信息

| 项目 | 值 |
|------|-----|
| 服务器 IP | 10.72.212.33 |
| SSH 用户 | zju321 |
| SSH 密钥 | `C:/Users/Mac/.ssh/id_ed25519_scholars_tea` |
| 项目路径 | `/data/home/zju321/Scholar-s_Tea` |
| PostgreSQL 路径 | `/data/home/zju321/pgdata` |
