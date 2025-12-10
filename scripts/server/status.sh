#!/bin/bash
#
# Agent Master 状态查询脚本
# 用途：显示服务状态和资源使用情况
#

set -u

# ============================================
# 颜色定义
# ============================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ============================================
# 配置变量
# ============================================
APP_NAME="agent-master"
APP_PORT=3000

# ============================================
# 日志函数
# ============================================
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_section() {
    echo -e "${BLUE}==== $1 ====${NC}"
}

# ============================================
# 检查 PM2
# ============================================
check_pm2() {
    if ! command -v pm2 >/dev/null 2>&1; then
        echo "PM2 未安装"
        exit 1
    fi
}

# ============================================
# 显示 PM2 状态
# ============================================
show_pm2_status() {
    log_section "PM2 进程状态"
    pm2 status "$APP_NAME" 2>/dev/null || echo "服务未运行"
    echo ""
}

# ============================================
# 显示资源使用
# ============================================
show_resource_usage() {
    log_section "资源使用情况"

    if pm2 list | grep -q "$APP_NAME"; then
        pm2 describe "$APP_NAME" | grep -E "(memory|cpu|uptime)"
    else
        echo "服务未运行"
    fi
    echo ""
}

# ============================================
# 显示端口状态
# ============================================
show_port_status() {
    log_section "端口监听状态"

    if command -v netstat >/dev/null 2>&1; then
        netstat -tlnp 2>/dev/null | grep ":$APP_PORT" || echo "端口 $APP_PORT 未被监听"
    elif command -v ss >/dev/null 2>&1; then
        ss -tlnp 2>/dev/null | grep ":$APP_PORT" || echo "端口 $APP_PORT 未被监听"
    else
        echo "无法检查端口状态（netstat 和 ss 都不可用）"
    fi
    echo ""
}

# ============================================
# 显示最近重启记录
# ============================================
show_restart_history() {
    log_section "最近重启记录"

    if pm2 list | grep -q "$APP_NAME"; then
        local restart_count
        restart_count=$(pm2 describe "$APP_NAME" | grep "restart time" | awk '{print $NF}')
        echo "重启次数: ${restart_count:-0}"
    else
        echo "服务未运行"
    fi
    echo ""
}

# ============================================
# 显示当前版本
# ============================================
show_current_version() {
    log_section "当前部署版本"

    local app_dir="$HOME/apps/$APP_NAME"
    if [ -L "$app_dir/current" ]; then
        local current_release
        current_release=$(readlink "$app_dir/current")
        echo "当前版本: $(basename "$current_release")"

        # 显示构建信息
        local build_info="$app_dir/current/buildinfo.json"
        if [ -f "$build_info" ]; then
            echo ""
            echo "构建信息:"
            cat "$build_info" | grep -E "(buildTime|gitCommit|gitBranch)" | sed 's/^/  /'
        fi
    else
        echo "未找到当前版本信息"
    fi
    echo ""
}

# ============================================
# 显示健康状态
# ============================================
show_health_status() {
    log_section "服务健康状态"

    # HTTP 健康检查
    if command -v curl >/dev/null 2>&1; then
        local http_code
        http_code=$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:$APP_PORT" 2>/dev/null || echo "000")

        if [ "$http_code" = "200" ]; then
            log_info "✓ HTTP 服务正常 (HTTP $http_code)"
        else
            echo "✗ HTTP 服务异常 (HTTP $http_code)"
        fi
    else
        echo "无法执行健康检查（curl 不可用）"
    fi
    echo ""
}

# ============================================
# 主函数
# ============================================
main() {
    echo "========================================"
    echo "Agent Master 服务状态"
    echo "========================================"
    echo ""

    check_pm2
    show_pm2_status
    show_resource_usage
    show_port_status
    show_restart_history
    show_current_version
    show_health_status
}

main
