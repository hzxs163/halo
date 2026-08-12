// GET /api/proxy/kuwo - 代理酷我搜索请求

export async function onRequest(context) {
  const { request } = context;
  
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // 获取前端传递的参数
    const url = new URL(request.url);
    const name = url.searchParams.get('name');
    const page = url.searchParams.get('page') || '1';
    const limit = url.searchParams.get('limit') || '10';
    
    if (!name) {
      return new Response(JSON.stringify({ error: 'name parameter is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 调用酷我 API（或代理服务）
    const targetUrl = `http://kw-api.cenguigui.cn/?name=${encodeURIComponent(name)}&page=${page}&limit=${limit}`;
    
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Kuwo API error: ${response.status}`);
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
    console.error('Kuwo proxy error:', error);
    // 返回空结果，让前端优雅降级
    return new Response(JSON.stringify({ 
      code: 200, 
      data: [],
      error: error.message 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
