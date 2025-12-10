#!/bin/bash
#
# Agent Master 启动服务脚本
# 用途：在服务器上启动 PM2 服务
#

set -e
set -u

# ============================================
# 颜色定义
# ============================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# ============================================
# 配置变量
# ============================================
APP_NAME="agent-master"
APP_DIR="${APP_DIR:-$HOME/apps/$APP_NAME}"
PM2_CONFIG="$APP_DIR/config/ecosystem.config.js"

# ============================================
# 日志函数
# ============================================
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# ============================================
# 检查 PM2
# ============================================
check_pm2() {
    if ! command -v pm2 >/dev/null 2>&1; then
        log_error "PM2 未安装！请先运行 setup.sh"
        exit 1
    fi
}

# ============================================
# 检查配置文件
# ============================================
check_config() {
    if [ ! -f "$PM2_CONFIG" ]; then
        log_error "PM2 配置文件不存在: $PM2_CONFIG"
        log_error "请先运行 setup.sh 初始化服务器"
        exit 1
    fi
}

# ============================================
# 检查应用目录
# ============================================
check_app_dir() {
    if [ ! -d "$APP_DIR/current" ]; then
        log_error "应用目录不存在: $APP_DIR/current"
        log_error "请先执行部署脚本"
        exit 1
    fi
}

# ============================================
# 启动服务
# ============================================
start_service() {
    cd "$APP_DIR"

    # 检查服务是否已在运行
    if pm2 list | grep -q "$APP_NAME"; then
        log_warn "服务已在运行"
        pm2 status "$APP_NAME"
        return 0
    fi

    log_info "正在启动服务..."
    pm2 start "$PM2_CONFIG"

    # 保存 PM2 进程列表
    pm2 save --force

    log_info "✓ 服务启动成功"
}

# ============================================
# 显示服务信息
# ============================================
show_info() {
    echo ""
    log_info "服务信息："
    pm2 status "$APP_NAME"

    echo ""
    log_info "访问地址："
    echo "  http://$(hostname -I | awk '{print $1}'):3000"

    echo ""
    log_info "日志位置："
    echo "  $APP_DIR/logs/"
}

# ============================================
# 主函数
# ============================================
main() {
    check_pm2
    check_config
    check_app_dir
    start_service
    show_info
}

main
