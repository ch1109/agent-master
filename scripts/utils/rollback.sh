#!/bin/bash
#
# Agent Master 回滚脚本
# 用途：回滚到指定版本
#

set -e
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
APP_DIR="${APP_DIR:-$HOME/apps/$APP_NAME}"
RELEASES_DIR="$APP_DIR/releases"

# 回滚参数
TARGET_VERSION=""
ROLLBACK_TO_LAST=false

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
trap 'log_error "回滚在第 $LINENO 行失败"' ERR

# ============================================
# 显示帮助
# ============================================
show_help() {
    cat << EOF
Agent Master 回滚脚本

用法:
  $0 [选项]

选项:
  --last              回滚到上一个版本
  --version VERSION   回滚到指定版本
  -h, --help          显示帮助信息

示例:
  $0                              # 交互式选择版本
  $0 --last                       # 回滚到上一个版本
  $0 --version 20251209_180000    # 回滚到指定版本

EOF
}

# ============================================
# 解析参数
# ============================================
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --last)
                ROLLBACK_TO_LAST=true
                shift
                ;;
            --version)
                TARGET_VERSION="$2"
                shift 2
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
# 获取当前版本
# ============================================
get_current_version() {
    if [ ! -L "$APP_DIR/current" ]; then
        echo ""
        return 1
    fi

    local current_release
    current_release=$(readlink "$APP_DIR/current")
    basename "$current_release"
}

# ============================================
# 列出可用版本
# ============================================
list_available_versions() {
    if [ ! -d "$RELEASES_DIR" ]; then
        log_error "版本目录不存在: $RELEASES_DIR"
        exit 1
    fi

    local versions
    versions=$(ls -1t "$RELEASES_DIR" 2>/dev/null || echo "")

    if [ -z "$versions" ]; then
        log_error "没有可用的版本"
        exit 1
    fi

    echo "$versions"
}

# ============================================
# 显示版本列表
# ============================================
show_version_list() {
    local current_version=$1
    local versions=$2

    echo "可用版本列表："
    echo ""
    echo "序号  版本名称              状态"
    echo "───────────────────────────────────"

    local index=1
    while IFS= read -r version; do
        if [ "$version" = "$current_version" ]; then
            echo "$index)   $version  [当前]"
        else
            echo "$index)   $version"
        fi
        index=$((index + 1))
    done <<< "$versions"

    echo ""
}

# ============================================
# 选择版本
# ============================================
select_version() {
    local current_version=$1
    local versions=$2

    if [ "$ROLLBACK_TO_LAST" = true ]; then
        # 回滚到上一个版本
        local last_version
        last_version=$(echo "$versions" | sed -n '2p')

        if [ -z "$last_version" ]; then
            log_error "没有上一个版本可回滚"
            exit 1
        fi

        if [ "$last_version" = "$current_version" ]; then
            log_error "上一个版本就是当前版本"
            exit 1
        fi

        echo "$last_version"
        return 0
    fi

    if [ -n "$TARGET_VERSION" ]; then
        # 验证指定版本是否存在
        if ! echo "$versions" | grep -q "^$TARGET_VERSION$"; then
            log_error "版本不存在: $TARGET_VERSION"
            exit 1
        fi

        if [ "$TARGET_VERSION" = "$current_version" ]; then
            log_error "目标版本就是当前版本"
            exit 1
        fi

        echo "$TARGET_VERSION"
        return 0
    fi

    # 交互式选择
    show_version_list "$current_version" "$versions"

    local version_array
    mapfile -t version_array <<< "$versions"

    while true; do
        read -p "请选择要回滚的版本序号 (1-${#version_array[@]}，或输入 q 退出): " choice

        if [ "$choice" = "q" ] || [ "$choice" = "Q" ]; then
            log_info "回滚已取消"
            exit 0
        fi

        if [[ "$choice" =~ ^[0-9]+$ ]] && [ "$choice" -ge 1 ] && [ "$choice" -le "${#version_array[@]}" ]; then
            local selected_version="${version_array[$((choice - 1))]}"

            if [ "$selected_version" = "$current_version" ]; then
                log_warn "不能回滚到当前版本，请重新选择"
                continue
            fi

            echo "$selected_version"
            return 0
        else
            log_warn "无效的选择，请重新输入"
        fi
    done
}

# ============================================
# 执行回滚
# ============================================
perform_rollback() {
    local target_version=$1
    local target_dir="$RELEASES_DIR/$target_version"

    log_step "执行回滚..."
    log_info "目标版本: $target_version"

    # 验证目标版本存在
    if [ ! -d "$target_dir" ]; then
        log_error "目标版本目录不存在: $target_dir"
        exit 1
    fi

    # 切换软链接
    log_info "切换当前版本..."
    ln -sfn "$target_dir" "$APP_DIR/current"

    log_info "✓ 版本切换完成"
}

# ============================================
# 重启服务
# ============================================
restart_service() {
    log_step "重启服务..."

    if command -v pm2 >/dev/null 2>&1; then
        if pm2 list | grep -q "$APP_NAME"; then
            pm2 restart "$APP_NAME"
            pm2 save --force
            log_info "✓ 服务重启完成"
        else
            log_warn "服务未运行，跳过重启"
        fi
    else
        log_warn "PM2 未安装，跳过服务重启"
    fi
}

# ============================================
# 验证回滚
# ============================================
verify_rollback() {
    log_step "验证回滚..."

    sleep 2

    if command -v pm2 >/dev/null 2>&1 && pm2 list | grep -q "$APP_NAME"; then
        if pm2 status "$APP_NAME" | grep -q "online"; then
            log_info "✓ 服务运行正常"
        else
            log_error "服务状态异常"
            return 1
        fi
    else
        log_warn "无法验证服务状态"
    fi
}

# ============================================
# 主函数
# ============================================
main() {
    echo "========================================"
    log_info "Agent Master 回滚"
    echo "========================================"
    echo ""

    parse_args "$@"

    local current_version
    current_version=$(get_current_version)

    if [ -n "$current_version" ]; then
        log_info "当前版本: $current_version"
    else
        log_warn "未检测到当前版本"
    fi

    echo ""

    local versions
    versions=$(list_available_versions)

    local target_version
    target_version=$(select_version "$current_version" "$versions")

    echo ""
    log_warn "即将回滚到版本: $target_version"
    read -p "确认继续？(y/N) " -n 1 -r
    echo ""

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "回滚已取消"
        exit 0
    fi

    echo ""
    perform_rollback "$target_version"
    restart_service
    verify_rollback

    echo ""
    log_info "回滚完成！"
}

main "$@"
