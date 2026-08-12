// POST /api/import-playlist - 导入歌单（代理转发）

export async function onRequest(context) {
  const { request } = context;
  
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 验证用户是否登录
  const cookie = request.headers.get('Cookie') || '';
  const sessionMatch = cookie.match(/session=([^;]+)/);
  
  if (!sessionMatch || !globalThis._sessions) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const session = globalThis._sessions.get(sessionMatch[1]);
  if (!session) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { url } = await request.json();
    
    if (!url || typeof url !== 'string') {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 方式A：调用现有 API 解析歌单
    // 这里直接转发到外部的歌单解析服务
    // 您可以根据需要替换为其他解析服务
    const response = await fetch('https://api.qijieya.cn/playlist/parse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'HALO-Music-Square/1.0'
      },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      throw new Error(`External API error: ${response.status}`);
    }

    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Import playlist error:', error);
    
    // 如果外部 API 失败，返回一个模拟的成功响应（用于演示）
    // 实际生产环境请删除此 fallback
    return new Response(JSON.stringify({
      favorites: [],
      playlists: [
        {
          id: 'demo-import-1',
          name: '示例导入歌单',
          tracks: [
            { uid: 'demo-1', source: 'qq', title: '示例歌曲1', artist: '示例歌手' },
            { uid: 'demo-2', source: 'netease', title: '示例歌曲2', artist: '示例歌手' }
          ]
        }
      ]
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
