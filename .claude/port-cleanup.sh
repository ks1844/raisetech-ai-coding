#!/bin/bash

# ポート競合時に指定されたポートでのみ起動するための補助スクリプト
# 使用法: ./.claude/port-cleanup.sh <port>

PORT=${1:-8080}

echo "ポート $PORT の確認中..."

# ポートに接続しているプロセスを確認
PIDS=$(lsof -ti :$PORT 2>/dev/null)

if [ -z "$PIDS" ]; then
    echo "ポート $PORT は空いています ✓"
    exit 0
else
    echo "ポート $PORT は以下のプロセスで使用されています:"
    lsof -i :$PORT

    echo ""
    echo "これらのプロセスを停止します..."

    for PID in $PIDS; do
        echo "PID $PID を停止中..."
        kill -9 $PID 2>/dev/null && echo "  → 停止成功" || echo "  → 停止失敗（既に終了している可能性）"
    done

    sleep 2

    # ポートが開放されたか再確認
    if lsof -i :$PORT >/dev/null 2>&1; then
        echo "警告: ポート $PORT はまだ使用されています"
        exit 1
    else
        echo "ポート $PORT は開放されました ✓"
        exit 0
    fi
fi
