import fetch from 'node-fetch'

async function testAPI() {
  console.log('Testing api.animethemes.moe connection...')
  
  try {
    const url = 'https://api.animethemes.moe/animetheme?page[number]=1&page[size]=5'
    console.log('Fetching:', url)
    
    const res = await fetch(url, { 
      headers: { 'User-Agent': 'Kaikansen-Test/1.0' },
      signal: AbortSignal.timeout(15000)
    })
    
    console.log('Status:', res.status)
    
    if (!res.ok) {
      console.log('❌ API returned error status')
      return
    }
    
    const data = await res.json()
    const themes = data.animethemes || []
    
    console.log('✅ Connected! Got', themes.length, 'themes')
    
    if (themes.length > 0) {
      console.log('\nSample theme:', themes[0].song?.title, '-', themes[0].anime?.name)
    }
    
  } catch (err) {
    console.log('❌ Error:', err.message)
    console.log('\nNetwork issue detected. Try:')
    console.log('1. Check internet connection')
    console.log('2. Try VPN if blocked')
    console.log('3. Run seed when network is reliable')
  }
}

testAPI()