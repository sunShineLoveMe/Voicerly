import os
import psycopg2

PGHOST = os.environ.get("PGHOST", "aws-1-ap-southeast-1.pooler.supabase.com")
PGPORT = os.environ.get("PGPORT", "6543")
PGDATABASE = os.environ.get("PGDATABASE", "postgres")
PGUSER = os.environ.get("PGUSER", "postgres.lejhjsgalirpnbinbgcc")
PGPASSWORD = os.environ.get("PGPASSWORD", "@Qq19891025")

sql_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "docs", "supabase_init.sql")

with open(sql_path, "r", encoding="utf-8") as f:
    sql = f.read()

print("Connecting to Supabase Postgres...")
conn = psycopg2.connect(
    host=PGHOST,
    port=PGPORT,
    dbname=PGDATABASE,
    user=PGUSER,
    password=PGPASSWORD,
    sslmode="require",
)
conn.autocommit = True
print("Executing SQL script...")

with conn.cursor() as cur:
    cur.execute(sql)

print("Done.")
conn.close()
