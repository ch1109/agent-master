#!/bin/bash
#
# Agent Master 重启服务脚本
# 用途：在服务器上重启 PM2 服务
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
HARD_RESTART=false

# ============================================
# 日志函数
# ============================================
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

# ============================================
# 解析参数
# ============================================
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --hard)
                HARD_RESTART=true
                shift
                ;;
            *)
                log_error "未知参数: $1"
                exit 1
                ;;
        esac
    done
}

# ============================================
# 检查 PM2
# ============================================
check_pm2() {
    if ! command -v pm2 >/dev/null 2>&1; then
        log_error "PM2 未安装"
        exit 1
    fi
}

# ============================================
# 重启服务
# ============================================
restart_service() {
    cd "$APP_DIR"

    if [ "$HARD_RESTART" = true ]; then
        log_info "执行硬重启（完全停止后重启）..."
        pm2 delete "$APP_NAME" 2>/dev/null || true
        sleep 2
        pm2 start "$PM2_CONFIG"
    else
        log_info "正在重启服务..."
        if pm2 list | grep -q "$APP_NAME"; then
            pm2 restart "$APP_NAME"
        else
            log_info "服务未运行，执行启动..."
            pm2 start "$PM2_CONFIG"
        fi
    fi

    # 保存 PM2 进程列表
    pm2 save --force

    log_info "✓ 服务重启成功"
}

# ============================================
# 显示状态
# ============================================
show_status() {
    sleep 2
    echo ""
    pm2 status "$APP_NAME"
}

# ============================================
# 主函数
# ============================================
main() {
    parse_args "$@"
    check_pm2
    restart_service
    show_status
}

main "$@"
