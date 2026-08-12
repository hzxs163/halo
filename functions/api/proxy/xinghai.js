// GET /api/proxy/xinghai - 代理星海音乐 API

export async function onRequest(context) {
  const { request } = context;
  
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const url = new URL(request.url);
    const source = url.searchParams.get('source');
    const keyword = url.searchParams.get('keyword');
    const id = url.searchParams.get('id');
    const type = url.searchParams.get('type') || 'search';
    const limit = url.searchParams.get('limit') || '10';
    
    let targetUrl;
    
    if (type === 'search' && keyword) {
      targetUrl = `https://music-api.gdstudio.xyz/api.php?types=search&source=${source}&keyword=${encodeURIComponent(keyword)}&limit=${limit}`;
    } else if (type === 'url' && id) {
      targetUrl = `https://music-api.gdstudio.xyz/api.php?types=url&source=${source}&id=${encodeURIComponent(id)}&br=320`;
    } else {
      return new Response(JSON.stringify({ error: 'Missing parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'HALO-Music-Square/1.0',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300'
      }
    });
  } catch (error) {
    console.error('Xinghai proxy error:', error);
    return new Response(JSON.stringify({ 
      code: 500, 
      data: [],
      error: error.message 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
