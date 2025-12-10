#!/bin/bash
#
# Agent Master 备份脚本
# 用途：手动备份当前运行版本
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
BACKUP_DIR="$APP_DIR/backups"
MAX_BACKUPS=5

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
trap 'log_error "备份在第 $LINENO 行失败"' ERR

# ============================================
# 检查当前版本
# ============================================
check_current_version() {
    if [ ! -L "$APP_DIR/current" ]; then
        log_error "当前版本不存在"
        exit 1
    fi

    local current_release
    current_release=$(readlink "$APP_DIR/current")

    if [ ! -d "$current_release" ]; then
        log_error "当前版本目录不存在: $current_release"
        exit 1
    fi

    echo "$current_release"
}

# ============================================
# 创建备份
# ============================================
create_backup() {
    local current_release=$1
    local release_name
    release_name=$(basename "$current_release")

    log_step "开始备份..."
    log_info "备份版本: $release_name"

    # 创建备份目录
    mkdir -p "$BACKUP_DIR"

    # 生成备份文件名
    local backup_file="$BACKUP_DIR/${release_name}.tgz"

    # 检查备份是否已存在
    if [ -f "$backup_file" ]; then
        log_warn "备份已存在: $backup_file"
        read -p "是否覆盖？(y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "备份取消"
            exit 0
        fi
    fi

    # 创建备份
    log_info "正在打包..."
    tar -czf "$backup_file" -C "$current_release" .

    local file_size
    file_size=$(du -h "$backup_file" | cut -f1)

    log_info "✓ 备份完成: $backup_file ($file_size)"
}

# ============================================
# 清理旧备份
# ============================================
cleanup_old_backups() {
    log_step "清理旧备份..."

    cd "$BACKUP_DIR"
    local backup_count
    backup_count=$(ls -1 *.tgz 2>/dev/null | wc -l)

    if [ "$backup_count" -le "$MAX_BACKUPS" ]; then
        log_info "备份数量: $backup_count，无需清理"
        return 0
    fi

    log_info "备份数量: $backup_count，清理旧备份（保留最近 $MAX_BACKUPS 个）"

    # 删除最旧的备份
    ls -t *.tgz | tail -n +$((MAX_BACKUPS + 1)) | xargs -r rm -f

    log_info "✓ 清理完成"
}

# ============================================
# 显示备份列表
# ============================================
show_backup_list() {
    log_step "当前备份列表"

    if [ ! -d "$BACKUP_DIR" ] || [ -z "$(ls -A "$BACKUP_DIR"/*.tgz 2>/dev/null)" ]; then
        echo "无备份文件"
        return 0
    fi

    echo ""
    echo "文件名                          大小      日期"
    echo "─────────────────────────────────────────────────"
    ls -lht "$BACKUP_DIR"/*.tgz | awk '{printf "%-30s %-8s %s %s %s\n", $9, $5, $6, $7, $8}'
    echo ""
}

# ============================================
# 主函数
# ============================================
main() {
    echo "========================================"
    log_info "Agent Master 备份"
    echo "========================================"
    echo ""

    local current_release
    current_release=$(check_current_version)

    create_backup "$current_release"
    cleanup_old_backups
    show_backup_list

    echo ""
    log_info "备份操作完成"
}

main
