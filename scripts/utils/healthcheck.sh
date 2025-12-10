#!/bin/bash
#
# Agent Master 健康检查脚本
# 用途：定期检查服务健康状态，可配合 crontab 使用
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
APP_PORT=3000
LOG_FILE="$APP_DIR/logs/healthcheck.log"

# 健康检查阈值
MAX_MEMORY_MB=500
MAX_RESTART_COUNT=10
HTTP_TIMEOUT=5

# 退出码
EXIT_OK=0
EXIT_WARNING=1
EXIT_CRITICAL=2

# ============================================
# 日志函数
# ============================================
log_to_file() {
    local level=$1
    local message=$2
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$level] $message" >> "$LOG_FILE"
}

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
    log_to_file "INFO" "$1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
    log_to_file "WARN" "$1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
    log_to_file "ERROR" "$1"
}

# ============================================
# 检查 PM2 进程
# ============================================
check_pm2_process() {
    if ! command -v pm2 >/dev/null 2>&1; then
        log_error "PM2 未安装"
        return $EXIT_CRITICAL
    fi

    if ! pm2 list | grep -q "$APP_NAME"; then
        log_error "应用未在 PM2 中运行"
        return $EXIT_CRITICAL
    fi

    local status
    status=$(pm2 jlist | jq -r ".[] | select(.name == \"$APP_NAME\") | .pm2_env.status" 2>/dev/null || echo "unknown")

    if [ "$status" != "online" ]; then
        log_error "应用状态异常: $status"
        return $EXIT_CRITICAL
    fi

    log_info "✓ PM2 进程正常"
    return $EXIT_OK
}

# ============================================
# 检查内存使用
# ============================================
check_memory_usage() {
    if ! command -v pm2 >/dev/null 2>&1; then
        return $EXIT_OK
    fi

    local memory_mb
    memory_mb=$(pm2 jlist | jq -r ".[] | select(.name == \"$APP_NAME\") | .monit.memory" 2>/dev/null || echo "0")
    memory_mb=$((memory_mb / 1024 / 1024))

    if [ "$memory_mb" -gt "$MAX_MEMORY_MB" ]; then
        log_warn "内存使用过高: ${memory_mb}MB (阈值: ${MAX_MEMORY_MB}MB)"
        return $EXIT_WARNING
    fi

    log_info "✓ 内存使用正常: ${memory_mb}MB"
    return $EXIT_OK
}

# ============================================
# 检查重启次数
# ============================================
check_restart_count() {
    if ! command -v pm2 >/dev/null 2>&1; then
        return $EXIT_OK
    fi

    local restart_count
    restart_count=$(pm2 jlist | jq -r ".[] | select(.name == \"$APP_NAME\") | .pm2_env.restart_time" 2>/dev/null || echo "0")

    if [ "$restart_count" -gt "$MAX_RESTART_COUNT" ]; then
        log_warn "重启次数过多: $restart_count 次 (阈值: $MAX_RESTART_COUNT 次)"
        return $EXIT_WARNING
    fi

    log_info "✓ 重启次数正常: $restart_count 次"
    return $EXIT_OK
}

# ============================================
# 检查端口监听
# ============================================
check_port_listening() {
    local port_check=false

    if command -v netstat >/dev/null 2>&1; then
        if netstat -tlnp 2>/dev/null | grep -q ":$APP_PORT"; then
            port_check=true
        fi
    elif command -v ss >/dev/null 2>&1; then
        if ss -tlnp 2>/dev/null | grep -q ":$APP_PORT"; then
            port_check=true
        fi
    fi

    if [ "$port_check" = false ]; then
        log_error "端口 $APP_PORT 未被监听"
        return $EXIT_CRITICAL
    fi

    log_info "✓ 端口监听正常"
    return $EXIT_OK
}

# ============================================
# 检查 HTTP 响应
# ============================================
check_http_response() {
    if ! command -v curl >/dev/null 2>&1; then
        log_warn "curl 不可用，跳过 HTTP 检查"
        return $EXIT_OK
    fi

    local http_code
    http_code=$(curl -s -o /dev/null -w '%{http_code}' --max-time "$HTTP_TIMEOUT" "http://localhost:$APP_PORT" 2>/dev/null || echo "000")

    if [ "$http_code" != "200" ]; then
        log_error "HTTP 响应异常: $http_code"
        return $EXIT_CRITICAL
    fi

    log_info "✓ HTTP 响应正常"
    return $EXIT_OK
}

# ============================================
# 检查磁盘空间
# ============================================
check_disk_space() {
    local disk_usage
    disk_usage=$(df -h "$APP_DIR" | tail -1 | awk '{print $5}' | sed 's/%//')

    if [ "$disk_usage" -gt 90 ]; then
        log_error "磁盘空间不足: ${disk_usage}%"
        return $EXIT_CRITICAL
    elif [ "$disk_usage" -gt 80 ]; then
        log_warn "磁盘空间告警: ${disk_usage}%"
        return $EXIT_WARNING
    fi

    log_info "✓ 磁盘空间充足: ${disk_usage}%"
    return $EXIT_OK
}

# ============================================
# 尝试自动修复
# ============================================
auto_recovery() {
    log_warn "尝试自动恢复服务..."

    if command -v pm2 >/dev/null 2>&1; then
        pm2 restart "$APP_NAME" 2>/dev/null || true
        sleep 5

        if pm2 list | grep -q "$APP_NAME" && pm2 jlist | jq -r ".[] | select(.name == \"$APP_NAME\") | .pm2_env.status" | grep -q "online"; then
            log_info "✓ 服务已自动恢复"
            return $EXIT_OK
        else
            log_error "自动恢复失败"
            return $EXIT_CRITICAL
        fi
    fi

    return $EXIT_CRITICAL
}

# ============================================
# 发送告警（可扩展）
# ============================================
send_alert() {
    local level=$1
    local message=$2

    # 这里可以扩展告警方式：邮件、钉钉、企业微信等
    log_to_file "ALERT" "[$level] $message"

    # 示例：写入告警文件
    local alert_file="$APP_DIR/logs/alerts.log"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$level] $message" >> "$alert_file"
}

# ============================================
# 主函数
# ============================================
main() {
    local exit_code=$EXIT_OK
    local issues=()

    # 确保日志目录存在
    mkdir -p "$(dirname "$LOG_FILE")"

    log_info "========================================"
    log_info "开始健康检查"
    log_info "========================================"

    # 执行各项检查
    if ! check_pm2_process; then
        exit_code=$EXIT_CRITICAL
        issues+=("PM2进程异常")

        # 尝试自动恢复
        if auto_recovery; then
            exit_code=$EXIT_WARNING
        fi
    fi

    if ! check_port_listening; then
        exit_code=$EXIT_CRITICAL
        issues+=("端口监听异常")
    fi

    if ! check_http_response; then
        exit_code=$EXIT_CRITICAL
        issues+=("HTTP响应异常")
    fi

    if ! check_memory_usage; then
        [ $exit_code -lt $EXIT_WARNING ] && exit_code=$EXIT_WARNING
        issues+=("内存使用过高")
    fi

    if ! check_restart_count; then
        [ $exit_code -lt $EXIT_WARNING ] && exit_code=$EXIT_WARNING
        issues+=("重启次数过多")
    fi

    if ! check_disk_space; then
        [ $exit_code -lt $EXIT_WARNING ] && exit_code=$EXIT_WARNING
        issues+=("磁盘空间不足")
    fi

    # 总结
    log_info "========================================"
    if [ $exit_code -eq $EXIT_OK ]; then
        log_info "健康检查通过"
    elif [ $exit_code -eq $EXIT_WARNING ]; then
        log_warn "健康检查告警: ${issues[*]}"
        send_alert "WARNING" "${issues[*]}"
    else
        log_error "健康检查失败: ${issues[*]}"
        send_alert "CRITICAL" "${issues[*]}"
    fi
    log_info "========================================"

    exit $exit_code
}

main
