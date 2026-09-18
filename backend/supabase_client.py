from supabase import Client, create_client

# Supabase project configuration.
# This is the public anon key. Database security must still be enforced
# with Supabase RLS policies.
SUPABASE_URL = "https://qqevrdjzwuoebszqcurf.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxZXZyZGp6d3VvZWJzenFjdXJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MTIwNzgsImV4cCI6MjEwNTI4ODA3OH0.6HKFTohM85ZDSc3sge6T7H86dztMYt9E0uel3apSHOs"

supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
)
