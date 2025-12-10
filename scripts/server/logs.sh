#!/bin/bash
#
# Agent Master 日志查看脚本
# 用途：查看服务日志
#

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
LOG_DIR="$APP_DIR/logs"

# 默认参数
ERROR_ONLY=false
LINES=50
FOLLOW=true

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
# 显示帮助
# ============================================
show_help() {
    cat << EOF
Agent Master 日志查看脚本

用法:
  $0 [选项]

选项:
  --error         仅显示错误日志
  --lines N       显示最近 N 行（默认: 50）
  --no-follow     不跟踪日志（默认会实时跟踪）
  -h, --help      显示帮助信息

示例:
  $0                    # 实时查看所有日志
  $0 --error            # 仅查看错误日志
  $0 --lines 100        # 查看最近 100 行
  $0 --no-follow        # 查看日志不跟踪

EOF
}

# ============================================
# 解析参数
# ============================================
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --error)
                ERROR_ONLY=true
                shift
                ;;
            --lines)
                LINES="$2"
                shift 2
                ;;
            --no-follow)
                FOLLOW=false
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                log_error "未知参数: $1"
                show_help
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
# 显示日志文件信息
# ============================================
show_log_info() {
    echo "========================================"
    log_info "日志文件位置"
    echo "========================================"
    echo ""

    if [ -d "$LOG_DIR" ]; then
        echo "日志目录: $LOG_DIR"
        echo ""
        echo "可用日志文件:"
        ls -lh "$LOG_DIR"/*.log 2>/dev/null || echo "  无日志文件"
    else
        log_error "日志目录不存在: $LOG_DIR"
    fi

    echo ""
    echo "========================================"
}

# ============================================
# 查看 PM2 日志
# ============================================
view_pm2_logs() {
    # 检查服务是否在运行
    if ! pm2 list | grep -q "$APP_NAME"; then
        log_error "服务未运行"
        exit 1
    fi

    if [ "$ERROR_ONLY" = true ]; then
        log_info "查看错误日志（最近 $LINES 行）..."
        echo ""
        if [ "$FOLLOW" = true ]; then
            pm2 logs "$APP_NAME" --err --lines "$LINES"
        else
            pm2 logs "$APP_NAME" --err --lines "$LINES" --nostream
        fi
    else
        log_info "查看所有日志（最近 $LINES 行）..."
        echo ""
        if [ "$FOLLOW" = true ]; then
            pm2 logs "$APP_NAME" --lines "$LINES"
        else
            pm2 logs "$APP_NAME" --lines "$LINES" --nostream
        fi
    fi
}

# ============================================
# 查看文件日志
# ============================================
view_file_logs() {
    if [ "$ERROR_ONLY" = true ]; then
        local error_log="$LOG_DIR/error.log"
        if [ -f "$error_log" ]; then
            log_info "错误日志:"
            echo ""
            if [ "$FOLLOW" = true ]; then
                tail -f -n "$LINES" "$error_log"
            else
                tail -n "$LINES" "$error_log"
            fi
        else
            log_error "错误日志文件不存在"
        fi
    else
        log_info "访问日志:"
        echo ""
        local access_log="$LOG_DIR/access.log"
        if [ -f "$access_log" ]; then
            if [ "$FOLLOW" = true ]; then
                tail -f -n "$LINES" "$access_log"
            else
                tail -n "$LINES" "$access_log"
            fi
        else
            log_error "访问日志文件不存在"
        fi
    fi
}

# ============================================
# 主函数
# ============================================
main() {
    parse_args "$@"
    check_pm2

    # 优先使用 PM2 日志
    if pm2 list | grep -q "$APP_NAME"; then
        view_pm2_logs
    else
        # 如果服务未运行，尝试查看日志文件
        show_log_info
        view_file_logs
    fi
}

main "$@"
