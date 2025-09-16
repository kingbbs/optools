#!/bin/bash

# OpTools 備份腳本
# 用法: ./backup.sh [full|config|logs] [backup_dir]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")"
DEFAULT_BACKUP_DIR="$HOME/backups/optools"
BACKUP_DIR="${2:-$DEFAULT_BACKUP_DIR}"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_TYPE="${1:-full}"

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# 創建備份目錄
create_backup_dir() {
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        print_message $GREEN "✅ 創建備份目錄：$BACKUP_DIR"
    fi
}

# 完整備份
backup_full() {
    local backup_file="$BACKUP_DIR/optools_full_$DATE.tar.gz"
    
    print_message $BLUE "📦 開始完整備份..."
    
    # 排除不需要備份的文件和目錄
    tar -czf "$backup_file" \
        --exclude="node_modules" \
        --exclude="logs/*.log" \
        --exclude=".git" \
        --exclude="*.pid" \
        --exclude="tmp" \
        --exclude="temp" \
        -C "$(dirname "$APP_DIR")" \
        "$(basename "$APP_DIR")"
    
    if [ $? -eq 0 ]; then
        local size=$(du -h "$backup_file" | cut -f1)
        print_message $GREEN "✅ 完整備份完成：$backup_file ($size)"
        return 0
    else
        print_message $RED "❌ 完整備份失敗"
        return 1
    fi
}

# 配置備份
backup_config() {
    local backup_file="$BACKUP_DIR/optools_config_$DATE.tar.gz"
    
    print_message $BLUE "⚙️  開始配置備份..."
    
    # 備份配置文件
    tar -czf "$backup_file" -C "$APP_DIR" \
        package.json \
        ecosystem.config.js \
        .env \
        nginx.conf.example \
        .env.example \
        optools.sh \
        scripts/ \
        2>/dev/null
    
    if [ $? -eq 0 ]; then
        local size=$(du -h "$backup_file" | cut -f1)
        print_message $GREEN "✅ 配置備份完成：$backup_file ($size)"
        return 0
    else
        print_message $RED "❌ 配置備份失敗"
        return 1
    fi
}

# 日誌備份
backup_logs() {
    local backup_file="$BACKUP_DIR/optools_logs_$DATE.tar.gz"
    
    print_message $BLUE "📋 開始日誌備份..."
    
    if [ -d "$APP_DIR/logs" ]; then
        tar -czf "$backup_file" -C "$APP_DIR" logs/
        
        if [ $? -eq 0 ]; then
            local size=$(du -h "$backup_file" | cut -f1)
            print_message $GREEN "✅ 日誌備份完成：$backup_file ($size)"
            return 0
        else
            print_message $RED "❌ 日誌備份失敗"
            return 1
        fi
    else
        print_message $YELLOW "⚠️  日誌目錄不存在，跳過日誌備份"
        return 0
    fi
}

# 數據庫備份 (如果需要)
backup_database() {
    local backup_file="$BACKUP_DIR/optools_db_$DATE.sql"
    
    print_message $BLUE "🗄️  開始數據庫備份..."
    
    # 示例：MongoDB 備份
    # mongodump --db optools --out "$BACKUP_DIR/mongodb_$DATE"
    
    # 示例：MySQL 備份
    # mysqldump -u username -p optools > "$backup_file"
    
    print_message $YELLOW "⚠️  數據庫備份功能未配置"
    return 0
}

# 清理舊備份
cleanup_old_backups() {
    local retention_days=${1:-30}
    
    print_message $BLUE "🧹 清理 $retention_days 天前的備份..."
    
    local deleted_count=0
    while IFS= read -r -d '' file; do
        rm "$file"
        ((deleted_count++))
        print_message $YELLOW "  刪除：$(basename "$file")"
    done < <(find "$BACKUP_DIR" -name "optools_*.tar.gz" -mtime +$retention_days -print0)
    
    if [ $deleted_count -gt 0 ]; then
        print_message $GREEN "✅ 清理完成，刪除了 $deleted_count 個舊備份"
    else
        print_message $GREEN "✅ 沒有需要清理的舊備份"
    fi
}

# 驗證備份
verify_backup() {
    local backup_file="$1"
    
    print_message $BLUE "🔍 驗證備份文件..."
    
    if [ ! -f "$backup_file" ]; then
        print_message $RED "❌ 備份文件不存在：$backup_file"
        return 1
    fi
    
    # 檢查文件大小
    local size=$(stat -f%z "$backup_file" 2>/dev/null || stat -c%s "$backup_file" 2>/dev/null)
    if [ "$size" -lt 1024 ]; then
        print_message $RED "❌ 備份文件太小，可能有問題：$backup_file"
        return 1
    fi
    
    # 測試解壓
    if tar -tzf "$backup_file" >/dev/null 2>&1; then
        print_message $GREEN "✅ 備份文件驗證通過：$backup_file"
        return 0
    else
        print_message $RED "❌ 備份文件損壞：$backup_file"
        return 1
    fi
}

# 恢復備份
restore_backup() {
    local backup_file="$1"
    local restore_dir="${2:-$APP_DIR}"
    
    print_message $BLUE "🔄 恢復備份..."
    
    if [ ! -f "$backup_file" ]; then
        print_message $RED "❌ 備份文件不存在：$backup_file"
        return 1
    fi
    
    # 驗證備份文件
    if ! verify_backup "$backup_file"; then
        return 1
    fi
    
    # 停止應用
    print_message $YELLOW "⏸️  停止應用..."
    pm2 stop optools 2>/dev/null || true
    
    # 備份當前配置
    if [ -d "$restore_dir" ]; then
        local current_backup="$restore_dir.backup.$(date +%Y%m%d_%H%M%S)"
        mv "$restore_dir" "$current_backup"
        print_message $YELLOW "⚠️  當前版本已備份到：$current_backup"
    fi
    
    # 解壓備份
    mkdir -p "$(dirname "$restore_dir")"
    tar -xzf "$backup_file" -C "$(dirname "$restore_dir")"
    
    if [ $? -eq 0 ]; then
        print_message $GREEN "✅ 備份恢復完成"
        
        # 重新安裝依賴
        cd "$restore_dir"
        if [ -f "package.json" ]; then
            print_message $BLUE "📦 重新安裝依賴..."
            npm install
        fi
        
        # 重啟應用
        print_message $BLUE "🚀 重啟應用..."
        pm2 start ecosystem.config.js --env production
        
        return 0
    else
        print_message $RED "❌ 備份恢復失敗"
        return 1
    fi
}

# 列出備份
list_backups() {
    print_message $BLUE "📋 可用備份列表："
    
    if [ ! -d "$BACKUP_DIR" ]; then
        print_message $YELLOW "⚠️  備份目錄不存在：$BACKUP_DIR"
        return 1
    fi
    
    local count=0
    for backup in "$BACKUP_DIR"/optools_*.tar.gz; do
        if [ -f "$backup" ]; then
            local size=$(du -h "$backup" | cut -f1)
            local date=$(stat -f%Sm -t"%Y-%m-%d %H:%M" "$backup" 2>/dev/null || stat -c%y "$backup" 2>/dev/null | cut -d' ' -f1-2)
            printf "  %-40s %8s %s\n" "$(basename "$backup")" "$size" "$date"
            ((count++))
        fi
    done
    
    if [ $count -eq 0 ]; then
        print_message $YELLOW "⚠️  沒有找到備份文件"
    else
        print_message $GREEN "✅ 找到 $count 個備份文件"
    fi
}

# 顯示幫助
show_help() {
    echo "OpTools 備份腳本"
    echo ""
    echo "用法: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "命令:"
    echo "  full                完整備份 (默認)"
    echo "  config              僅備份配置文件"
    echo "  logs                僅備份日誌文件"
    echo "  database            備份數據庫"
    echo "  cleanup [days]      清理舊備份 (默認保留30天)"
    echo "  verify <file>       驗證備份文件"
    echo "  restore <file>      恢復備份"
    echo "  list                列出所有備份"
    echo "  help                顯示此幫助"
    echo ""
    echo "選項:"
    echo "  -d, --dir <path>    指定備份目錄 (默認: $DEFAULT_BACKUP_DIR)"
    echo ""
    echo "範例:"
    echo "  $0 full                          # 完整備份"
    echo "  $0 config                        # 僅備份配置"
    echo "  $0 cleanup 7                     # 清理7天前的備份"
    echo "  $0 verify /path/to/backup.tar.gz # 驗證備份"
    echo "  $0 restore /path/to/backup.tar.gz # 恢復備份"
}

# 主函數
main() {
    case "$BACKUP_TYPE" in
        "full")
            create_backup_dir
            backup_full
            cleanup_old_backups
            ;;
        "config")
            create_backup_dir
            backup_config
            ;;
        "logs")
            create_backup_dir
            backup_logs
            ;;
        "database")
            create_backup_dir
            backup_database
            ;;
        "cleanup")
            cleanup_old_backups "${2:-30}"
            ;;
        "verify")
            verify_backup "$2"
            ;;
        "restore")
            if [ -z "$2" ]; then
                print_message $RED "❌ 請指定備份文件"
                exit 1
            fi
            restore_backup "$2" "$3"
            ;;
        "list")
            list_backups
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        *)
            print_message $RED "❌ 未知命令: $BACKUP_TYPE"
            show_help
            exit 1
            ;;
    esac
}

# 執行主函數
main "$@"