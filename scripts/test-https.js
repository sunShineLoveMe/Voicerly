const https = require('https')
const { config } = require('dotenv')

// Load environment variables
config({ path: '.env.local' })

console.log('🔍 Testing HTTPS Connection with Node.js built-in module...')

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  console.log('❌ Missing environment variables')
  process.exit(1)
}

const options = {
  hostname: 'lejhjsgalirpnbinbgcc.supabase.co',
  port: 443,
  path: '/rest/v1/',
  method: 'GET',
  headers: {
    'apikey': anonKey,
    'Authorization': `Bearer ${anonKey}`,
    'User-Agent': 'Node.js Test'
  },
  timeout: 10000
}

console.log('🌐 Attempting connection to:', options.hostname)

const req = https.request(options, (res) => {
  console.log('✅ Connection successful!')
  console.log('Status:', res.statusCode)
  console.log('Headers:', res.headers)
  
  let data = ''
  res.on('data', (chunk) => {
    data += chunk
  })
  
  res.on('end', () => {
    console.log('Response length:', data.length)
    if (data.length < 200) {
      console.log('Response preview:', data)
    }
  })
})

req.on('error', (error) => {
  console.log('❌ Connection failed:', error.message)
  console.log('Error code:', error.code)
})

req.on('timeout', () => {
  console.log('❌ Connection timeout')
  req.destroy()
})

req.setTimeout(10000)
req.end()
