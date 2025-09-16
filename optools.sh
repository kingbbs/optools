#!/bin/bash

# OpTools 服務器管理腳本
# 用法: ./optools.sh [start|stop|restart|status]

PID_FILE="optools.pid"
LOG_FILE="optools.log"
PORT=3080

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 顯示帶顏色的訊息
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# 檢查服務器狀態
check_status() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if ps -p $pid > /dev/null 2>&1; then
            return 0  # 運行中
        else
            rm -f "$PID_FILE"  # 清理無效的 PID 文件
            return 1  # 未運行
        fi
    else
        return 1  # 未運行
    fi
}

# 啟動服務器
start_server() {
    if check_status; then
        print_message $YELLOW "⚠️  服務器已經在運行中 (PID: $(cat $PID_FILE))"
        return 1
    fi

    print_message $BLUE "🚀 正在啟動 OpTools 服務器..."
    
    # 啟動服務器並記錄 PID
    nohup node server.js > "$LOG_FILE" 2>&1 &
    local pid=$!
    echo $pid > "$PID_FILE"
    
    # 等待服務器啟動
    sleep 2
    
    if check_status; then
        print_message $GREEN "✅ OpTools 服務器啟動成功！"
        print_message $GREEN "📱 訪問 http://localhost:$PORT 來使用工具"
        print_message $BLUE "📋 PID: $(cat $PID_FILE)"
        print_message $BLUE "📝 日誌文件: $LOG_FILE"
    else
        print_message $RED "❌ 服務器啟動失敗"
        rm -f "$PID_FILE"
        return 1
    fi
}

# 停止服務器
stop_server() {
    if ! check_status; then
        print_message $YELLOW "⚠️  服務器未運行"
        return 1
    fi

    local pid=$(cat "$PID_FILE")
    print_message $BLUE "🛑 正在停止 OpTools 服務器 (PID: $pid)..."
    
    # 嘗試優雅停止
    kill $pid
    
    # 等待進程停止
    local count=0
    while ps -p $pid > /dev/null 2>&1 && [ $count -lt 10 ]; do
        sleep 1
        count=$((count + 1))
    done
    
    # 如果還在運行，強制停止
    if ps -p $pid > /dev/null 2>&1; then
        print_message $YELLOW "⚠️  優雅停止失敗，正在強制停止..."
        kill -9 $pid
        sleep 1
    fi
    
    rm -f "$PID_FILE"
    print_message $GREEN "✅ OpTools 服務器已停止"
}

# 重啟服務器
restart_server() {
    print_message $BLUE "🔄 正在重啟 OpTools 服務器..."
    stop_server
    sleep 1
    start_server
}

# 顯示服務器狀態
show_status() {
    if check_status; then
        local pid=$(cat "$PID_FILE")
        print_message $GREEN "✅ OpTools 服務器正在運行"
        print_message $BLUE "📋 PID: $pid"
        print_message $BLUE "🌐 URL: http://localhost:$PORT"
        print_message $BLUE "📝 日誌文件: $LOG_FILE"
        
        # 檢查端口是否被佔用
        if lsof -i :$PORT > /dev/null 2>&1; then
            print_message $GREEN "🔌 端口 $PORT 正在使用中"
        else
            print_message $YELLOW "⚠️  端口 $PORT 未被佔用（可能啟動失敗）"
        fi
    else
        print_message $RED "❌ OpTools 服務器未運行"
    fi
}

# 顯示幫助信息
show_help() {
    echo "OpTools 服務器管理腳本"
    echo ""
    echo "用法: $0 [COMMAND]"
    echo ""
    echo "可用命令:"
    echo "  start    啟動服務器"
    echo "  stop     停止服務器"
    echo "  restart  重啟服務器"
    echo "  status   顯示服務器狀態"
    echo "  logs     顯示服務器日誌"
    echo "  help     顯示此幫助信息"
    echo ""
    echo "範例:"
    echo "  $0 start     # 啟動服務器"
    echo "  $0 restart   # 重啟服務器"
    echo "  $0 status    # 檢查狀態"
}

# 顯示日誌
show_logs() {
    if [ -f "$LOG_FILE" ]; then
        print_message $BLUE "📝 OpTools 服務器日誌 (最後 50 行):"
        echo "----------------------------------------"
        tail -n 50 "$LOG_FILE"
    else
        print_message $YELLOW "⚠️  日誌文件不存在"
    fi
}

# 主邏輯
case "${1:-help}" in
    start)
        start_server
        ;;
    stop)
        stop_server
        ;;
    restart)
        restart_server
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_message $RED "❌ 未知命令: $1"
        echo ""
        show_help
        exit 1
        ;;
esac