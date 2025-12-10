#!/bin/bash
#
# Agent Master 清理脚本
# 用途：清理旧版本和日志文件
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
BACKUPS_DIR="$APP_DIR/backups"
LOGS_DIR="$APP_DIR/logs"

# 保留策略
KEEP_RELEASES=3
KEEP_BACKUPS=5
KEEP_LOGS_DAYS=7

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
trap 'log_error "清理在第 $LINENO 行失败"' ERR

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
# 清理旧版本
# ============================================
cleanup_old_releases() {
    log_step "清理旧版本..."

    if [ ! -d "$RELEASES_DIR" ]; then
        log_warn "版本目录不存在: $RELEASES_DIR"
        return 0
    fi

    local current_version
    current_version=$(get_current_version)

    cd "$RELEASES_DIR"
    local release_count
    release_count=$(ls -1 2>/dev/null | wc -l)

    if [ "$release_count" -le "$KEEP_RELEASES" ]; then
        log_info "版本数量: $release_count，无需清理"
        return 0
    fi

    log_info "版本数量: $release_count，清理旧版本（保留最近 $KEEP_RELEASES 个）"

    # 获取要保留的版本列表
    local keep_list
    keep_list=$(ls -1t | head -n "$KEEP_RELEASES")

    # 添加当前版本到保留列表（如果不在列表中）
    if [ -n "$current_version" ] && ! echo "$keep_list" | grep -q "^$current_version$"; then
        keep_list="$keep_list"$'\n'"$current_version"
    fi

    local deleted_count=0
    for release in $(ls -1t); do
        if ! echo "$keep_list" | grep -q "^$release$"; then
            log_info "删除旧版本: $release"
            rm -rf "$release"
            deleted_count=$((deleted_count + 1))
        fi
    done

    log_info "✓ 清理完成，删除了 $deleted_count 个旧版本"
}

# ============================================
# 清理旧备份
# ============================================
cleanup_old_backups() {
    log_step "清理旧备份..."

    if [ ! -d "$BACKUPS_DIR" ]; then
        log_warn "备份目录不存在: $BACKUPS_DIR"
        return 0
    fi

    cd "$BACKUPS_DIR"
    local backup_count
    backup_count=$(ls -1 *.tgz 2>/dev/null | wc -l)

    if [ "$backup_count" -eq 0 ]; then
        log_info "无备份文件"
        return 0
    fi

    if [ "$backup_count" -le "$KEEP_BACKUPS" ]; then
        log_info "备份数量: $backup_count，无需清理"
        return 0
    fi

    log_info "备份数量: $backup_count，清理旧备份（保留最近 $KEEP_BACKUPS 个）"

    local deleted_count=0
    for backup in $(ls -1t *.tgz | tail -n +$((KEEP_BACKUPS + 1))); do
        log_info "删除旧备份: $backup"
        rm -f "$backup"
        deleted_count=$((deleted_count + 1))
    done

    log_info "✓ 清理完成，删除了 $deleted_count 个旧备份"
}

# ============================================
# 清理过期日志
# ============================================
cleanup_old_logs() {
    log_step "清理过期日志..."

    if [ ! -d "$LOGS_DIR" ]; then
        log_warn "日志目录不存在: $LOGS_DIR"
        return 0
    fi

    # 清理归档日志
    if [ -d "$LOGS_DIR/archive" ]; then
        log_info "清理 $KEEP_LOGS_DAYS 天前的归档日志..."

        local deleted_count=0
        find "$LOGS_DIR/archive" -name "*.log.gz" -type f -mtime +$KEEP_LOGS_DAYS | while read -r log_file; do
            log_info "删除过期日志: $(basename "$log_file")"
            rm -f "$log_file"
            deleted_count=$((deleted_count + 1))
        done

        if [ "$deleted_count" -gt 0 ]; then
            log_info "✓ 清理完成，删除了 $deleted_count 个日志文件"
        else
            log_info "无过期日志文件"
        fi
    else
        log_info "无归档日志目录"
    fi
}

# ============================================
# 显示磁盘使用情况
# ============================================
show_disk_usage() {
    log_step "磁盘使用情况"

    if [ -d "$APP_DIR" ]; then
        echo ""
        echo "目录                大小"
        echo "────────────────────────────"

        if [ -d "$RELEASES_DIR" ]; then
            local releases_size
            releases_size=$(du -sh "$RELEASES_DIR" 2>/dev/null | cut -f1)
            echo "releases/          $releases_size"
        fi

        if [ -d "$BACKUPS_DIR" ]; then
            local backups_size
            backups_size=$(du -sh "$BACKUPS_DIR" 2>/dev/null | cut -f1)
            echo "backups/           $backups_size"
        fi

        if [ -d "$LOGS_DIR" ]; then
            local logs_size
            logs_size=$(du -sh "$LOGS_DIR" 2>/dev/null | cut -f1)
            echo "logs/              $logs_size"
        fi

        echo "────────────────────────────"
        local total_size
        total_size=$(du -sh "$APP_DIR" 2>/dev/null | cut -f1)
        echo "总计               $total_size"
        echo ""
    fi
}

# ============================================
# 显示清理摘要
# ============================================
show_summary() {
    echo ""
    echo "========================================"
    log_info "清理完成"
    echo "========================================"
    echo ""

    log_info "保留策略："
    echo "  - 版本: 最近 $KEEP_RELEASES 个"
    echo "  - 备份: 最近 $KEEP_BACKUPS 个"
    echo "  - 日志: 最近 $KEEP_LOGS_DAYS 天"
    echo ""

    show_disk_usage
}

# ============================================
# 主函数
# ============================================
main() {
    echo "========================================"
    log_info "Agent Master 清理"
    echo "========================================"
    echo ""

    log_warn "即将清理旧版本、备份和日志文件"
    read -p "确认继续？(y/N) " -n 1 -r
    echo ""

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "清理已取消"
        exit 0
    fi

    echo ""
    cleanup_old_releases
    echo ""
    cleanup_old_backups
    echo ""
    cleanup_old_logs
    echo ""
    show_summary
}

main
