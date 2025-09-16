#!/bin/bash

# OpTools 監控腳本
# 用法: ./monitor.sh [check|report|alert]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")"
LOG_FILE="$APP_DIR/logs/monitor.log"
ALERT_LOG="$APP_DIR/logs/alerts.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# 創建日誌目錄
mkdir -p "$APP_DIR/logs"

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 日誌函數
log_info() {
    echo "[$DATE] INFO: $1" >> "$LOG_FILE"
    echo -e "${GREEN}[$DATE] INFO: $1${NC}"
}

log_warn() {
    echo "[$DATE] WARN: $1" >> "$LOG_FILE"
    echo "[$DATE] WARN: $1" >> "$ALERT_LOG"
    echo -e "${YELLOW}[$DATE] WARN: $1${NC}"
}

log_error() {
    echo "[$DATE] ERROR: $1" >> "$LOG_FILE"
    echo "[$DATE] ERROR: $1" >> "$ALERT_LOG"
    echo -e "${RED}[$DATE] ERROR: $1${NC}"
}

# 檢查應用狀態
check_app_status() {
    if ! pm2 list | grep -q "optools.*online"; then
        log_error "OpTools 服務離線，正在重啟..."
        pm2 restart optools
        sleep 5
        if pm2 list | grep -q "optools.*online"; then
            log_info "OpTools 服務重啟成功"
            return 0
        else
            log_error "OpTools 服務重啟失敗"
            return 1
        fi
    else
        log_info "OpTools 服務運行正常"
        return 0
    fi
}

# 檢查端口
check_port() {
    local port=${1:-3080}
    if netstat -tlnp | grep -q ":$port "; then
        log_info "端口 $port 正常監聽"
        return 0
    else
        log_warn "端口 $port 未在監聽"
        return 1
    fi
}

# 檢查磁盤使用率
check_disk_usage() {
    local threshold=${1:-85}
    local usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ "$usage" -gt "$threshold" ]; then
        log_warn "磁盤使用率過高：$usage% (閾值: $threshold%)"
        return 1
    else
        log_info "磁盤使用率正常：$usage%"
        return 0
    fi
}

# 檢查內存使用率
check_memory_usage() {
    local threshold=${1:-90}
    local usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    
    if [ "$usage" -gt "$threshold" ]; then
        log_warn "內存使用率過高：$usage% (閾值: $threshold%)"
        return 1
    else
        log_info "內存使用率正常：$usage%"
        return 0
    fi
}

# 檢查 CPU 使用率
check_cpu_usage() {
    local threshold=${1:-80}
    local usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')
    
    if [ -n "$usage" ] && [ "${usage%.*}" -gt "$threshold" ]; then
        log_warn "CPU 使用率過高：$usage% (閾值: $threshold%)"
        return 1
    else
        log_info "CPU 使用率正常：${usage:-N/A}%"
        return 0
    fi
}

# 檢查日誌文件大小
check_log_size() {
    local max_size=${1:-100} # MB
    local log_files=("$APP_DIR/logs/out.log" "$APP_DIR/logs/err.log" "$APP_DIR/logs/combined.log")
    
    for log_file in "${log_files[@]}"; do
        if [ -f "$log_file" ]; then
            local size=$(du -m "$log_file" | cut -f1)
            if [ "$size" -gt "$max_size" ]; then
                log_warn "日誌文件過大：$log_file ($size MB)"
                # 可選：自動輪轉日誌
                # logrotate -f /etc/logrotate.d/optools
            fi
        fi
    done
}

# 檢查應用響應
check_app_response() {
    local url="http://localhost:3080"
    local timeout=10
    
    if curl -s --max-time "$timeout" "$url" > /dev/null; then
        log_info "應用響應正常"
        return 0
    else
        log_error "應用無響應或響應超時"
        return 1
    fi
}

# 完整健康檢查
health_check() {
    log_info "開始健康檢查..."
    
    local failures=0
    
    check_app_status || ((failures++))
    check_port 3080 || ((failures++))
    check_disk_usage 85 || ((failures++))
    check_memory_usage 90 || ((failures++))
    check_cpu_usage 80 || ((failures++))
    check_log_size 100 || ((failures++))
    check_app_response || ((failures++))
    
    if [ "$failures" -eq 0 ]; then
        log_info "健康檢查完成，所有項目正常"
    else
        log_warn "健康檢查完成，發現 $failures 個問題"
    fi
    
    return "$failures"
}

# 生成報告
generate_report() {
    local report_file="$APP_DIR/logs/health_report_$(date +%Y%m%d_%H%M%S).txt"
    
    {
        echo "OpTools 健康報告"
        echo "生成時間: $(date)"
        echo "================================"
        echo ""
        
        echo "系統信息:"
        echo "  操作系統: $(uname -a)"
        echo "  運行時間: $(uptime)"
        echo ""
        
        echo "應用狀態:"
        pm2 list | grep optools || echo "  PM2 進程未找到"
        echo ""
        
        echo "資源使用:"
        echo "  CPU 使用率: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}')"
        echo "  內存使用: $(free -h | awk 'NR==2{printf "%.1f/%.1f GB (%.1f%%)", $3/1024/1024, $2/1024/1024, $3*100/$2}')"
        echo "  磁盤使用: $(df -h / | awk 'NR==2{printf "%s/%s (%s)", $3, $2, $5}')"
        echo ""
        
        echo "網路狀態:"
        echo "  端口監聽: $(netstat -tlnp | grep :3080 || echo "端口 3080 未監聽")"
        echo ""
        
        echo "最近日誌:"
        if [ -f "$APP_DIR/logs/combined.log" ]; then
            tail -n 20 "$APP_DIR/logs/combined.log"
        else
            echo "  日誌文件不存在"
        fi
        
    } > "$report_file"
    
    log_info "健康報告已生成：$report_file"
    echo "$report_file"
}

# 清理舊日誌
cleanup_logs() {
    local days=${1:-30}
    
    log_info "清理 $days 天前的日誌文件..."
    
    # 清理監控日誌
    find "$APP_DIR/logs" -name "*.log" -mtime +$days -delete
    
    # 清理報告文件
    find "$APP_DIR/logs" -name "health_report_*.txt" -mtime +7 -delete
    
    log_info "日誌清理完成"
}

# 發送告警 (示例：可以集成郵件、Slack、微信等)
send_alert() {
    local message="$1"
    local urgency="${2:-normal}" # low, normal, high
    
    # 示例：寫入告警日誌
    echo "[$DATE] [$urgency] $message" >> "$ALERT_LOG"
    
    # TODO: 實現實際的告警發送邏輯
    # 例如：curl -X POST -H 'Content-type: application/json' --data '{"text":"'$message'"}' YOUR_SLACK_WEBHOOK_URL
}

# 主函數
main() {
    case "${1:-check}" in
        "check")
            health_check
            ;;
        "report")
            generate_report
            ;;
        "cleanup")
            cleanup_logs "${2:-30}"
            ;;
        "alert")
            send_alert "${2:-測試告警}" "${3:-normal}"
            ;;
        *)
            echo "用法: $0 [check|report|cleanup|alert]"
            echo "  check   - 執行健康檢查 (默認)"
            echo "  report  - 生成健康報告"
            echo "  cleanup - 清理舊日誌文件"
            echo "  alert   - 發送測試告警"
            exit 1
            ;;
    esac
}

# 執行主函數
main "$@"