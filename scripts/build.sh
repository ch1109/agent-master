#!/bin/bash
#
# Agent Master 本地构建脚本
# 用途：构建生产版本并打包为 tgz 格式
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
DIST_DIR="$PROJECT_ROOT/dist"
BUILD_INFO_FILE="$PROJECT_ROOT/buildinfo.json"
OUTPUT_FILE="$PROJECT_ROOT/dist.tgz"

# ============================================
# 日志函数
# ============================================
log_info() {
    echo -e "${GREEN}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1" >&2
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"
}

# ============================================
# 错误处理
# ============================================
trap 'log_error "构建在第 $LINENO 行失败"' ERR

# ============================================
# 清理旧的构建产物
# ============================================
clean_old_build() {
    log_step "清理旧的构建产物..."

    if [ -d "$DIST_DIR" ]; then
        rm -rf "$DIST_DIR"
        log_info "已删除旧的 dist 目录"
    fi

    if [ -f "$OUTPUT_FILE" ]; then
        rm -f "$OUTPUT_FILE"
        log_info "已删除旧的 dist.tgz 文件"
    fi

    log_info "✓ 清理完成"
}

# ============================================
# 执行构建
# ============================================
run_build() {
    log_step "执行构建..."

    cd "$PROJECT_ROOT"
    npm run build

    if [ ! -d "$DIST_DIR" ]; then
        log_error "构建失败：dist 目录未生成"
        exit 1
    fi

    log_info "✓ 构建完成"
}

# ============================================
# 创建构建信息文件
# ============================================
create_build_info() {
    log_step "创建构建信息文件..."

    local git_commit="unknown"
    local git_branch="unknown"

    if command -v git >/dev/null 2>&1 && [ -d "$PROJECT_ROOT/.git" ]; then
        git_commit=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
        git_branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
    fi

    cat > "$BUILD_INFO_FILE" << EOF
{
  "buildTime": "$(date '+%Y-%m-%d %H:%M:%S')",
  "buildTimestamp": $(date +%s),
  "gitCommit": "$git_commit",
  "gitBranch": "$git_branch",
  "nodeVersion": "$(node -v)",
  "npmVersion": "$(npm -v)"
}
EOF

    log_info "✓ 构建信息已保存到 buildinfo.json"
}

# ============================================
# 打包 dist 目录
# ============================================
package_dist() {
    log_step "打包 dist 目录..."

    cd "$PROJECT_ROOT"

    # 将 buildinfo.json 复制到 dist 目录
    cp "$BUILD_INFO_FILE" "$DIST_DIR/"

    # 打包为 tgz
    tar -czf "$OUTPUT_FILE" -C "$DIST_DIR" .

    local file_size
    file_size=$(du -h "$OUTPUT_FILE" | cut -f1)

    log_info "✓ 打包完成: $OUTPUT_FILE ($file_size)"
}

# ============================================
# 显示构建摘要
# ============================================
show_summary() {
    echo ""
    echo "========================================"
    log_info "构建完成！"
    echo "========================================"
    echo ""
    log_info "构建产物："
    echo "  - dist/          (构建目录)"
    echo "  - dist.tgz       (打包文件)"
    echo "  - buildinfo.json (构建信息)"
    echo ""
    log_info "下一步："
    echo "  执行 ./scripts/deploy.sh 进行部署"
    echo ""
}

# ============================================
# 主函数
# ============================================
main() {
    echo "========================================"
    log_info "Agent Master 构建开始"
    echo "========================================"
    echo ""

    clean_old_build
    run_build
    create_build_info
    package_dist
    show_summary
}

# 执行主函数
main
