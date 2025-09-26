const { config } = require('dotenv')

// Load environment variables
config({ path: '.env.local' })

console.log('🔍 Testing Supabase Connection...')
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Anon Key (first 20 chars):', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20))
console.log('Service Key (first 20 chars):', process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20))

// Test basic fetch
async function testConnection() {
  try {
    console.log('\n🌐 Testing basic connectivity...')
    
    // Test basic fetch to Supabase
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
      }
    })
    
    console.log('✅ Connection successful!')
    console.log('Status:', response.status)
    console.log('Headers:', Object.fromEntries(response.headers.entries()))
    
  } catch (error) {
    console.log('❌ Connection failed:', error.message)
    console.log('Error details:', error)
    
    // Try with different timeout
    console.log('\n🔄 Trying with longer timeout...')
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 seconds
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
        method: 'GET',
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      console.log('✅ Connection successful with longer timeout!')
      console.log('Status:', response.status)
      
    } catch (timeoutError) {
      console.log('❌ Still failed with longer timeout:', timeoutError.message)
    }
  }
}

testConnection()
