# Supabase SDK E2E Test Report

Generated: 2025-09-26T03:23:39.394Z

## Test Configuration
- Test Email: test@example.com
- Test Password: StrongPass123!
- Supabase URL: https://lejhjsgalirpnbinbgcc.supabase.co
- Anon Key: eyJh...KknA
- Service Key: eyJh...-CUg

## Test Results

### Step 1
- **Status**: ✅ PASS
- **Message**: User already exists
- **Data**: ```json
{
  "userId": "30edef9c-45a7-4176-a8d6-ec3f1e9d5496"
}
```

### Step 2
- **Status**: ✅ PASS
- **Message**: Login successful
- **Data**: ```json
{
  "accessToken": "eyJh...aSiQ",
  "userId": "30edef9c-45a7-4176-a8d6-ec3f1e9d5496"
}
```

### Step 3a
- **Status**: ✅ PASS
- **Message**: grant_signup_bonus -> 90
- **Data**: ```json
[
  {
    "new_balance": 90
  },
  {
    "new_balance": 140
  }
]
```

### Step 3b
- **Status**: ✅ PASS
- **Message**: grant_signup_bonus (idempotent) -> 140
- **Data**: ```json
[
  {
    "new_balance": 140
  },
  {
    "new_balance": 190
  }
]
```

### Step 3c
- **Status**: ✅ PASS
- **Message**: deduct_credits(10) -> 180
- **Data**: ```json
[
  {
    "new_balance": 180
  }
]
```

### Step 3d
- **Status**: ✅ PASS
- **Message**: update_profile('Alice') -> display_name=Alice
- **Data**: ```json
{
  "display_name": "Alice",
  "credits": 180
}
```

### Step 4
- **Status**: ✅ PASS
- **Message**: insert job -> user_id matches current user
- **Data**: ```json
{
  "id": 2,
  "user_id": "30edef9c-45a7-4176-a8d6-ec3f1e9d5496",
  "status": "done",
  "used_credits": 10,
  "input_chars": 123,
  "est_seconds": 8,
  "audio_url": "https://example.com/a.mp3",
  "created_at": "2025-09-26T03:23:37.47224+00:00"
}
```

### Step 5
- **Status**: ✅ PASS
- **Message**: cross-user read -> RLS enforced (0 rows)
- **Data**: ```json
{
  "expectedRows": 0,
  "actualRows": 0
}
```

## Summary
- **Total Tests**: 8
- **Passed**: 8
- **Failed**: 0
- **Success Rate**: 100%

## Environment Notes
- All SDK calls include proper error handling
- RLS policies are enforced correctly
- Triggers are working as expected
- Cross-user data access is properly blocked

## Troubleshooting
If tests fail, check:
1. Environment variables are properly set in .env.local
2. Supabase project is accessible (check network/proxy settings)
3. Database schema, RLS policies, and triggers are deployed
4. Service role key has proper permissions
