#!/bin/bash
# 一键测试 Supabase Postgres 连接（Pooler & Direct）

# === 请在这里填写你的数据库信息 ===
PROJECT_REF="lejhjsgalirpnbinbgcc"      # Supabase 项目 ref
DB_PASSWORD="@Qq19891025"               # 你的数据库密码（原始，不用编码）
DB_NAME="postgres"                      # 默认数据库

# === 用户名配置 ===
USER_POOLER="postgres.${PROJECT_REF}"   # Pooler 必须带项目后缀
USER_DIRECT="postgres"                  # Direct 用默认 postgres

# === Host 配置 ===
HOST_POOLER="aws-1-ap-southeast-1.pooler.supabase.com"
PORT_POOLER=6543
HOST_DIRECT="db.${PROJECT_REF}.supabase.co"
PORT_DIRECT=5432

echo "======================================"
echo " Testing Supabase Postgres Connection "
echo " Project: $PROJECT_REF"
echo "======================================"

# --- Pooler Test ---
echo
echo "🔹 Testing Pooler (IPv4, Port $PORT_POOLER)..."
PGPASSWORD="$DB_PASSWORD" psql "host=$HOST_POOLER port=$PORT_POOLER dbname=$DB_NAME user=$USER_POOLER sslmode=require" -c "select now();" 2>/dev/null
if [ $? -eq 0 ]; then
  echo "✅ Pooler (6543) Connection SUCCESS"
else
  echo "❌ Pooler (6543) Connection FAILED"
fi

# --- Direct Test ---
echo
echo "🔹 Testing Direct (IPv6, Port $PORT_DIRECT)..."
PGPASSWORD="$DB_PASSWORD" psql "host=$HOST_DIRECT port=$PORT_DIRECT dbname=$DB_NAME user=$USER_DIRECT sslmode=require" -c "select now();" 2>/dev/null
if [ $? -eq 0 ]; then
  echo "✅ Direct (5432) Connection SUCCESS"
else
  echo "❌ Direct (5432) Connection FAILED"
fi

echo
echo "======================================"
echo " Test Completed "
echo "======================================"
