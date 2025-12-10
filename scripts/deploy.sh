#!/bin/bash
#
# Agent Master 一键部署脚本
# 用途：本地执行，自动构建并部署到服务器
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
NC='\033[0m'

# ============================================
# 配置变量
# ============================================
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_FILE="$PROJECT_ROOT/dist.tgz"

# 服务器配置
SERVER_HOST="192.168.100.62"
SERVER_USER="hywl"
SERVER_APP_DIR="/home/$SERVER_USER/apps/agent-master"
SERVER_PORT=3000

# 部署配置
SKIP_BUILD=false
NO_BACKUP=false
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RELEASE_NAME="$TIMESTAMP"

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
trap 'log_error "部署在第 $LINENO 行失败"' ERR

# ============================================
# 显示帮助信息
# ============================================
show_help() {
    cat << EOF
Agent Master 部署脚本

用法:
  $0 [选项]

选项:
  --skip-build    跳过构建，直接部署现有的 dist.tgz
  --no-backup     不备份旧版本
  --port PORT     指定端口（默认: 3000）
  -h, --help      显示帮助信息

示例:
  $0                     # 完整部署（构建 + 部署）
  $0 --skip-build        # 跳过构建，仅部署
  $0 --port 8080         # 指定端口为 8080

EOF
}

# ============================================
# 解析参数
# ============================================
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-build)
                SKIP_BUILD=true
                shift
                ;;
            --no-backup)
                NO_BACKUP=true
                shift
                ;;
            --port)
                SERVER_PORT="$2"
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
# 执行构建
# ============================================
run_build() {
    if [ "$SKIP_BUILD" = true ]; then
        log_warn "跳过构建步骤"

        if [ ! -f "$DIST_FILE" ]; then
            log_error "dist.tgz 不存在，请先执行构建或去掉 --skip-build 参数"
            exit 1
        fi
        return 0
    fi

    log_step "执行构建..."
    "$PROJECT_ROOT/scripts/build.sh"
    log_info "✓ 构建完成"
}

# ============================================
# 验证服务器连接
# ============================================
verify_server_connection() {
    log_step "验证服务器连接..."

    if ! ssh -o ConnectTimeout=5 "$SERVER_USER@$SERVER_HOST" "echo '连接成功'" >/dev/null 2>&1; then
        log_error "无法连接到服务器 $SERVER_USER@$SERVER_HOST"
        log_error "请检查："
        echo "  1. 服务器地址和用户名是否正确"
        echo "  2. 网络连接是否正常"
        echo "  3. SSH 服务是否运行"
        exit 1
    fi

    log_info "✓ 服务器连接正常"
}

# ============================================
# 上传文件到服务器
# ============================================
upload_to_server() {
    log_step "上传文件到服务器..."

    local file_size
    file_size=$(du -h "$DIST_FILE" | cut -f1)
    log_info "准备上传: $DIST_FILE ($file_size)"

    scp "$DIST_FILE" "$SERVER_USER@$SERVER_HOST:/tmp/dist.tgz"

    log_info "✓ 文件上传完成"
}

# ============================================
# 在服务器上执行部署
# ============================================
deploy_on_server() {
    log_step "在服务器上执行部署..."

    # 构建远程执行脚本
    local remote_script=$(cat << 'REMOTE_SCRIPT_EOF'
set -e

APP_DIR="/home/hywl/apps/agent-master"
RELEASE_NAME="__RELEASE_NAME__"
RELEASE_DIR="$APP_DIR/releases/$RELEASE_NAME"
NO_BACKUP="__NO_BACKUP__"

echo "[INFO] 创建版本目录: $RELEASE_DIR"
mkdir -p "$RELEASE_DIR"

echo "[INFO] 解压文件到版本目录..."
tar -xzf /tmp/dist.tgz -C "$RELEASE_DIR"
rm -f /tmp/dist.tgz

# 备份当前版本
if [ -L "$APP_DIR/current" ] && [ "$NO_BACKUP" != "true" ]; then
    CURRENT_RELEASE=$(readlink "$APP_DIR/current")
    if [ -n "$CURRENT_RELEASE" ]; then
        CURRENT_RELEASE_NAME=$(basename "$CURRENT_RELEASE")
        echo "[INFO] 备份当前版本: $CURRENT_RELEASE_NAME"

        mkdir -p "$APP_DIR/backups"
        tar -czf "$APP_DIR/backups/${CURRENT_RELEASE_NAME}.tgz" -C "$CURRENT_RELEASE" .

        # 只保留最近 5 个备份
        cd "$APP_DIR/backups"
        ls -t *.tgz 2>/dev/null | tail -n +6 | xargs -r rm -f
    fi
fi

# 切换软链接
echo "[INFO] 切换当前版本到: $RELEASE_NAME"
ln -sfn "$RELEASE_DIR" "$APP_DIR/current"

# 只保留最近 3 个版本
cd "$APP_DIR/releases"
ls -t | tail -n +4 | xargs -r rm -rf

echo "[INFO] 部署完成"
REMOTE_SCRIPT_EOF
)

    # 替换变量
    remote_script="${remote_script//__RELEASE_NAME__/$RELEASE_NAME}"
    remote_script="${remote_script//__NO_BACKUP__/$NO_BACKUP}"

    # 执行远程脚本
    ssh "$SERVER_USER@$SERVER_HOST" "$remote_script"

    log_info "✓ 服务器部署完成"
}

# ============================================
# 重启服务
# ============================================
restart_service() {
    log_step "重启 PM2 服务..."

    ssh "$SERVER_USER@$SERVER_HOST" << 'RESTART_SCRIPT_EOF'
set -e

APP_DIR="/home/hywl/apps/agent-master"
PM2_CONFIG="$APP_DIR/config/ecosystem.config.js"

if [ -f "$PM2_CONFIG" ]; then
    cd "$APP_DIR"

    # 检查应用是否已在运行
    if pm2 list | grep -q "agent-master"; then
        echo "[INFO] 重启应用..."
        pm2 restart "$PM2_CONFIG"
    else
        echo "[INFO] 首次启动应用..."
        pm2 start "$PM2_CONFIG"
    fi

    # 保存 PM2 进程列表
    pm2 save --force

    echo "[INFO] 服务重启完成"
else
    echo "[WARN] PM2 配置文件不存在，跳过重启"
fi
RESTART_SCRIPT_EOF

    log_info "✓ 服务重启完成"
}

# ============================================
# 验证部署
# ============================================
verify_deployment() {
    log_step "验证部署..."

    # 等待服务启动
    sleep 3

    # 检查 PM2 状态
    log_info "检查 PM2 进程状态..."
    if ! ssh "$SERVER_USER@$SERVER_HOST" "pm2 status agent-master" | grep -q "online"; then
        log_error "服务未正常运行，请检查日志"
        return 1
    fi

    # 检查 HTTP 响应
    log_info "检查 HTTP 服务..."
    if ! ssh "$SERVER_USER@$SERVER_HOST" "curl -s -o /dev/null -w '%{http_code}' http://localhost:$SERVER_PORT" | grep -q "200"; then
        log_warn "HTTP 服务响应异常，请手动检查"
        return 0
    fi

    log_info "✓ 部署验证通过"
}

# ============================================
# 记录部署日志
# ============================================
log_deployment() {
    log_step "记录部署日志..."

    local log_file="$SERVER_APP_DIR/logs/deploy.log"
    local log_entry="[$(date '+%Y-%m-%d %H:%M:%S')] DEPLOY SUCCESS: Version $RELEASE_NAME"

    ssh "$SERVER_USER@$SERVER_HOST" "echo '$log_entry' >> '$log_file'"

    log_info "✓ 部署日志已记录"
}

# ============================================
# 显示部署摘要
# ============================================
show_summary() {
    echo ""
    echo "========================================"
    log_info "部署成功！"
    echo "========================================"
    echo ""
    log_info "部署信息："
    echo "  - 版本: $RELEASE_NAME"
    echo "  - 服务器: $SERVER_USER@$SERVER_HOST"
    echo "  - 端口: $SERVER_PORT"
    echo ""
    log_info "访问地址："
    echo "  http://$SERVER_HOST:$SERVER_PORT"
    echo ""
    log_info "服务管理："
    echo "  查看状态: ssh $SERVER_USER@$SERVER_HOST 'pm2 status agent-master'"
    echo "  查看日志: ssh $SERVER_USER@$SERVER_HOST 'pm2 logs agent-master'"
    echo "  重启服务: ssh $SERVER_USER@$SERVER_HOST 'pm2 restart agent-master'"
    echo ""
}

# ============================================
# 主函数
# ============================================
main() {
    echo "========================================"
    log_info "Agent Master 部署开始"
    echo "========================================"
    echo ""

    parse_args "$@"
    run_build
    verify_server_connection
    upload_to_server
    deploy_on_server
    restart_service
    verify_deployment
    log_deployment
    show_summary
}

# 执行主函数
main "$@"
