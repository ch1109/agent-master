# Agent Master 部署脚本使用指南

本目录包含了 Agent Master 项目的完整部署和运维脚本。

## 目录结构

```
scripts/
├── build.sh              # 本地构建脚本
├── deploy.sh             # 一键部署脚本
├── server/               # 服务器端脚本
│   ├── setup.sh          # 服务器初始化
│   ├── start.sh          # 启动服务
│   ├── stop.sh           # 停止服务
│   ├── restart.sh        # 重启服务
│   ├── status.sh         # 查看状态
│   └── logs.sh           # 查看日志
├── utils/                # 工具脚本
│   ├── backup.sh         # 备份当前版本
│   ├── rollback.sh       # 回滚到指定版本
│   ├── cleanup.sh        # 清理旧版本和日志
│   └── healthcheck.sh    # 健康检查
└── README.md             # 本文档
```

## 快速开始

### 1. 首次部署

#### 步骤 1：服务器初始化

在**本地**执行，上传初始化脚本到服务器：

```bash
scp scripts/server/setup.sh hywl@192.168.100.62:~/
```

在**服务器**上执行初始化：

```bash
ssh hywl@192.168.100.62
chmod +x ~/setup.sh
./setup.sh
```

初始化脚本会自动完成：
- 检查 Node.js 环境
- 安装 PM2 和 serve
- 创建目录结构
- 生成 PM2 配置文件
- 配置开机自启

#### 步骤 2：执行部署

在**本地**执行一键部署：

```bash
./scripts/deploy.sh
```

部署脚本会自动完成：
1. 构建项目（npm run build）
2. 打包 dist 目录
3. 上传到服务器
4. 解压并部署
5. 启动 PM2 服务
6. 验证部署成功

### 2. 日常更新部署

只需在本地执行：

```bash
./scripts/deploy.sh
```

## 脚本详细说明

### 本地脚本

#### build.sh - 本地构建

构建生产版本并打包为 tgz 格式。

**用法：**
```bash
./scripts/build.sh
```

**功能：**
- 清理旧的 dist 目录
- 执行 `npm run build`
- 创建构建信息文件（buildinfo.json）
- 打包为 dist.tgz

**输出：**
- `dist/` - 构建目录
- `dist.tgz` - 打包文件
- `buildinfo.json` - 构建信息

---

#### deploy.sh - 一键部署

本地执行，自动构建并部署到服务器。

**用法：**
```bash
# 完整部署（构建 + 部署）
./scripts/deploy.sh

# 跳过构建，直接部署现有的 dist.tgz
./scripts/deploy.sh --skip-build

# 不备份旧版本
./scripts/deploy.sh --no-backup

# 指定端口
./scripts/deploy.sh --port 8080
```

**参数：**
- `--skip-build` - 跳过构建步骤
- `--no-backup` - 不备份旧版本
- `--port PORT` - 指定端口（默认 3000）

**部署流程：**
1. 执行构建（可选）
2. 验证服务器连接
3. 上传文件
4. 创建新版本目录
5. 备份当前版本
6. 切换软链接
7. 重启服务
8. 验证部署

---

### 服务器端脚本

以下脚本需要在**服务器**上执行。

#### setup.sh - 服务器初始化

**用法：**
```bash
chmod +x ~/setup.sh
./setup.sh
```

**功能：**
- 检查 Node.js 版本
- 安装 PM2（全局）
- 安装 serve（全局）
- 创建目录结构
- 生成 PM2 配置文件
- 配置开机自启

**注意：**
- 仅需在首次部署时执行一次
- 如果输出 PM2 startup 命令，请按提示执行

---

#### start.sh - 启动服务

**用法：**
```bash
~/apps/agent-master/scripts/start.sh
```

**功能：**
- 检查环境
- 启动 PM2 服务
- 保存进程列表
- 显示访问地址

---

#### stop.sh - 停止服务

**用法：**
```bash
~/apps/agent-master/scripts/stop.sh
```

**功能：**
- 停止 PM2 服务
- 保存进程列表

---

#### restart.sh - 重启服务

**用法：**
```bash
# 普通重启
~/apps/agent-master/scripts/restart.sh

# 硬重启（完全停止后重启）
~/apps/agent-master/scripts/restart.sh --hard
```

**参数：**
- `--hard` - 硬重启模式

---

#### status.sh - 查看状态

**用法：**
```bash
~/apps/agent-master/scripts/status.sh
```

**显示信息：**
- PM2 进程状态
- 资源使用情况（CPU、内存）
- 端口监听状态
- 重启次数
- 当前版本信息
- HTTP 健康状态

---

#### logs.sh - 查看日志

**用法：**
```bash
# 实时查看所有日志
~/apps/agent-master/scripts/logs.sh

# 仅查看错误日志
~/apps/agent-master/scripts/logs.sh --error

# 查看最近 100 行
~/apps/agent-master/scripts/logs.sh --lines 100

# 不跟踪日志（查看后退出）
~/apps/agent-master/scripts/logs.sh --no-follow
```

**参数：**
- `--error` - 仅显示错误日志
- `--lines N` - 显示最近 N 行（默认 50）
- `--no-follow` - 不跟踪日志

---

### 工具脚本

#### backup.sh - 备份当前版本

**用法：**
```bash
~/apps/agent-master/scripts/backup.sh
```

**功能：**
- 备份当前运行版本
- 自动清理旧备份（保留最近 5 个）
- 显示备份列表

---

#### rollback.sh - 回滚版本

**用法：**
```bash
# 交互式选择版本
~/apps/agent-master/scripts/rollback.sh

# 回滚到上一个版本
~/apps/agent-master/scripts/rollback.sh --last

# 回滚到指定版本
~/apps/agent-master/scripts/rollback.sh --version 20251209_180000
```

**参数：**
- `--last` - 回滚到上一个版本
- `--version VERSION` - 回滚到指定版本

**流程：**
1. 列出可用版本
2. 选择目标版本
3. 确认回滚
4. 切换版本
5. 重启服务
6. 验证状态

---

#### cleanup.sh - 清理旧文件

**用法：**
```bash
~/apps/agent-master/scripts/cleanup.sh
```

**清理内容：**
- 旧版本（保留最近 3 个）
- 旧备份（保留最近 5 个）
- 过期日志（保留 7 天）

---

#### healthcheck.sh - 健康检查

**用法：**
```bash
# 手动执行
~/apps/agent-master/scripts/healthcheck.sh

# 配合 crontab 定时执行
crontab -e
# 添加：每 5 分钟检查一次
*/5 * * * * /home/hywl/apps/agent-master/scripts/healthcheck.sh
```

**检查项：**
- PM2 进程状态
- 内存使用（阈值 500MB）
- 重启次数（阈值 10 次）
- 端口监听
- HTTP 响应
- 磁盘空间

**自动恢复：**
- 检测到异常时自动尝试重启服务

---

## 服务器目录结构

```
/home/hywl/apps/agent-master/
├── current/                    # 当前运行版本（软链接）
├── releases/                   # 版本目录
│   ├── 20251209_180000/
│   ├── 20251209_190000/
│   └── 20251209_200000/
├── logs/                       # 日志目录
│   ├── access.log             # 访问日志
│   ├── error.log              # 错误日志
│   ├── pm2.log                # PM2 日志
│   ├── deploy.log             # 部署日志
│   ├── healthcheck.log        # 健康检查日志
│   └── alerts.log             # 告警日志
├── backups/                    # 备份目录
│   ├── 20251209_180000.tgz
│   └── 20251209_190000.tgz
├── config/                     # 配置目录
│   └── ecosystem.config.js    # PM2 配置
└── scripts/                    # 脚本目录（由部署脚本同步）
```

## 日志管理

### 日志文件位置

- **访问日志**：`~/apps/agent-master/logs/access.log`
- **错误日志**：`~/apps/agent-master/logs/error.log`
- **PM2 日志**：`~/apps/agent-master/logs/pm2.log`
- **部署日志**：`~/apps/agent-master/logs/deploy.log`

### 日志轮转

使用 PM2 内置日志轮转模块：

```bash
# 安装日志轮转模块
pm2 install pm2-logrotate

# 配置日志轮转
pm2 set pm2-logrotate:max_size 10M          # 单文件最大 10MB
pm2 set pm2-logrotate:retain 7              # 保留 7 天
pm2 set pm2-logrotate:compress true         # 启用 gzip 压缩
pm2 set pm2-logrotate:dateFormat YYYY-MM-DD
```

## 常见问题排查

### 问题 1：无法连接服务器

**症状：** deploy.sh 提示连接失败

**解决方法：**
```bash
# 1. 测试 SSH 连接
ssh hywl@192.168.100.62

# 2. 检查网络
ping 192.168.100.62

# 3. 检查 SSH 服务
ssh -v hywl@192.168.100.62
```

---

### 问题 2：服务无法访问

**症状：** 浏览器无法访问 http://192.168.100.62:3000

**解决方法：**
```bash
# 1. 检查 PM2 状态
pm2 status agent-master

# 2. 检查端口
netstat -tlnp | grep 3000

# 3. 查看错误日志
pm2 logs agent-master --err --lines 50

# 4. 检查防火墙
sudo ufw status
```

---

### 问题 3：PM2 频繁重启

**症状：** restart 次数很高

**解决方法：**
```bash
# 1. 查看错误日志
pm2 logs agent-master --err

# 2. 检查内存使用
pm2 monit

# 3. 检查文件权限
ls -la ~/apps/agent-master/current/
```

---

### 问题 4：页面显示空白

**症状：** 浏览器打开是空白页

**解决方法：**
```bash
# 1. 检查构建产物
ls -la ~/apps/agent-master/current/

# 2. 检查 index.html
cat ~/apps/agent-master/current/index.html

# 3. 检查浏览器控制台（F12）
# 查看是否有 JS/CSS 加载失败
```

---

## 运维最佳实践

### 1. 定期备份

建议在重要更新前手动备份：

```bash
ssh hywl@192.168.100.62
~/apps/agent-master/scripts/backup.sh
```

### 2. 定期清理

每周清理一次旧文件：

```bash
ssh hywl@192.168.100.62
~/apps/agent-master/scripts/cleanup.sh
```

### 3. 配置健康检查

设置定时健康检查：

```bash
ssh hywl@192.168.100.62
crontab -e
# 添加：
*/5 * * * * /home/hywl/apps/agent-master/scripts/healthcheck.sh
```

### 4. 监控日志大小

定期检查日志文件大小：

```bash
du -sh ~/apps/agent-master/logs/
```

### 5. 验证部署

每次部署后验证：

```bash
# 检查状态
ssh hywl@192.168.100.62 '~/apps/agent-master/scripts/status.sh'

# 浏览器访问
open http://192.168.100.62:3000
```

---

## 快速参考

### 本地操作

```bash
# 构建
./scripts/build.sh

# 部署
./scripts/deploy.sh

# 跳过构建直接部署
./scripts/deploy.sh --skip-build
```

### 服务器操作

```bash
# 连接服务器
ssh hywl@192.168.100.62

# 启动
~/apps/agent-master/scripts/start.sh

# 停止
~/apps/agent-master/scripts/stop.sh

# 重启
~/apps/agent-master/scripts/restart.sh

# 状态
~/apps/agent-master/scripts/status.sh

# 日志
~/apps/agent-master/scripts/logs.sh

# 备份
~/apps/agent-master/scripts/backup.sh

# 回滚
~/apps/agent-master/scripts/rollback.sh

# 清理
~/apps/agent-master/scripts/cleanup.sh
```

---

## 技术支持

如遇到问题，请检查：

1. **日志文件**：`~/apps/agent-master/logs/`
2. **PM2 状态**：`pm2 status agent-master`
3. **PM2 日志**：`pm2 logs agent-master`
4. **系统日志**：`journalctl -u pm2-hywl`

---

## 更新日志

- **2025-12-09**：初始版本，创建完整部署脚本体系
