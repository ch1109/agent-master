#!/bin/bash
#
# Agent Master 服务器初始化脚本
# 用途：首次部署时在服务器上运行，安装依赖并配置环境
#

set -e  # 遇到错误立即退出
set -u  # 使用未定义变量时报错

# ============================================
# 颜色定义
# ============================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================
# 配置变量
# ============================================
APP_NAME="agent-master"
APP_DIR="$HOME/apps/$APP_NAME"
APP_PORT=3000
NODE_MIN_VERSION="16.0.0"

# ============================================
# 日志函数
# ============================================
log_info() {
    echo -e "${GREEN}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1" >&2
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"
}

# ============================================
# 错误处理
# ============================================
trap 'log_error "脚本在第 $LINENO 行失败"' ERR

# ============================================
# 版本比较函数
# ============================================
version_gt() {
    test "$(printf '%s\n' "$@" | sort -V | head -n 1)" != "$1"
}

# ============================================
# 检查命令是否存在
# ============================================
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# ============================================
# 检查 Node.js 环境
# ============================================
check_node() {
    log_step "检查 Node.js 环境..."

    if ! command_exists node; then
        log_error "Node.js 未安装！请先安装 Node.js $NODE_MIN_VERSION 或更高版本"
        exit 1
    fi

    local node_version
    node_version=$(node -v | sed 's/v//')
    log_info "检测到 Node.js 版本: $node_version"

    if version_gt "$NODE_MIN_VERSION" "$node_version"; then
        log_error "Node.js 版本过低！需要 $NODE_MIN_VERSION 或更高版本"
        exit 1
    fi

    log_info "✓ Node.js 环境检查通过"
}

# ============================================
# 安装 PM2
# ============================================
install_pm2() {
    log_step "检查并安装 PM2..."

    if command_exists pm2; then
        local pm2_version
        pm2_version=$(pm2 -v)
        log_info "PM2 已安装，版本: $pm2_version"
        return 0
    fi

    log_info "正在安装 PM2..."
    npm install -g pm2

    if command_exists pm2; then
        log_info "✓ PM2 安装成功"
    else
        log_error "PM2 安装失败"
        exit 1
    fi
}

# ============================================
# 安装 serve
# ============================================
install_serve() {
    log_step "检查并安装 serve..."

    if command_exists serve; then
        local serve_version
        serve_version=$(serve -v)
        log_info "serve 已安装，版本: $serve_version"
        return 0
    fi

    log_info "正在安装 serve..."
    npm install -g serve

    if command_exists serve; then
        log_info "✓ serve 安装成功"
    else
        log_error "serve 安装失败"
        exit 1
    fi
}

# ============================================
# 创建目录结构
# ============================================
create_directories() {
    log_step "创建目录结构..."

    mkdir -p "$APP_DIR"/{releases,logs,backups,config,scripts}

    log_info "创建的目录："
    log_info "  - $APP_DIR/releases  (版本目录)"
    log_info "  - $APP_DIR/logs      (日志目录)"
    log_info "  - $APP_DIR/backups   (备份目录)"
    log_info "  - $APP_DIR/config    (配置目录)"
    log_info "  - $APP_DIR/scripts   (脚本目录)"

    log_info "✓ 目录结构创建成功"
}

# ============================================
# 生成 PM2 配置文件
# ============================================
generate_pm2_config() {
    log_step "生成 PM2 配置文件..."

    local config_file="$APP_DIR/config/ecosystem.config.js"

    cat > "$config_file" << 'EOF'
module.exports = {
  apps: [{
    name: 'agent-master',
    script: 'serve',
    args: '-s current -l 3000 -n',
    cwd: '/home/hywl/apps/agent-master',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/home/hywl/apps/agent-master/logs/error.log',
    out_file: '/home/hywl/apps/agent-master/logs/access.log',
    log_file: '/home/hywl/apps/agent-master/logs/pm2.log',
    time: true,
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
EOF

    log_info "✓ PM2 配置文件已生成: $config_file"
}

# ============================================
# 配置 PM2 开机自启
# ============================================
setup_pm2_startup() {
    log_step "配置 PM2 开机自启..."

    log_info "正在配置 PM2 startup..."

    # 生成 startup 脚本
    local startup_cmd
    startup_cmd=$(pm2 startup | grep "sudo" | tail -n 1)

    if [ -n "$startup_cmd" ]; then
        log_warn "需要执行以下命令配置开机自启（可能需要 sudo 权限）："
        echo "$startup_cmd"
        log_warn "请手动执行上述命令后再运行 'pm2 save'"
    else
        log_info "✓ PM2 startup 配置完成"
    fi
}

# ============================================
# 检查防火墙
# ============================================
check_firewall() {
    log_step "检查防火墙配置..."

    if ! command_exists ufw; then
        log_info "未检测到 ufw 防火墙"
        return 0
    fi

    local ufw_status
    ufw_status=$(sudo ufw status 2>/dev/null || echo "inactive")

    if echo "$ufw_status" | grep -q "inactive"; then
        log_info "防火墙未启用，无需配置"
        return 0
    fi

    log_warn "防火墙已启用，需要开放端口 $APP_PORT"
    log_warn "请执行以下命令："
    echo "sudo ufw allow $APP_PORT/tcp"
    echo "sudo ufw reload"
}

# ============================================
# 显示完成信息
# ============================================
show_completion_message() {
    echo ""
    echo "========================================"
    log_info "服务器初始化完成！"
    echo "========================================"
    echo ""
    log_info "下一步操作："
    echo "  1. 如果有 PM2 startup 命令提示，请先执行它"
    echo "  2. 在本地执行部署脚本："
    echo "     ./scripts/deploy.sh"
    echo ""
    log_info "服务管理命令："
    echo "  启动: $APP_DIR/scripts/start.sh"
    echo "  停止: $APP_DIR/scripts/stop.sh"
    echo "  重启: $APP_DIR/scripts/restart.sh"
    echo "  状态: $APP_DIR/scripts/status.sh"
    echo "  日志: $APP_DIR/scripts/logs.sh"
    echo ""
    log_info "应用访问地址："
    echo "  http://$(hostname -I | awk '{print $1}'):$APP_PORT"
    echo ""
}

# ============================================
# 主函数
# ============================================
main() {
    echo "========================================"
    log_info "Agent Master 服务器初始化"
    echo "========================================"
    echo ""

    check_node
    install_pm2
    install_serve
    create_directories
    generate_pm2_config
    setup_pm2_startup
    check_firewall
    show_completion_message
}

# 执行主函数
main
