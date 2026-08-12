// GET /api/library - 获取用户的收藏和歌单
// PUT /api/library - 保存用户的收藏和歌单
// 方式A：数据存在 localStorage 中，Workers 只是透传

export async function onRequest(context) {
  const { request } = context;
  
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

  const username = session.username;
  
  // 方式A：用 globalThis 做简单缓存（冷启动会丢失，但前端有 localStorage 兜底）
  if (!globalThis._userLibraries) {
    globalThis._userLibraries = new Map();
  }

  // GET: 获取用户数据
  if (request.method === 'GET') {
    const library = globalThis._userLibraries.get(username) || {
      favorites: [],
      playlists: []
    };
    
    return new Response(JSON.stringify({ library }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // PUT: 保存用户数据
  if (request.method === 'PUT') {
    try {
      const data = await request.json();
      
      // 基本验证
      if (!data || typeof data !== 'object') {
        return new Response(JSON.stringify({ error: 'Invalid library data' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 保存到内存（方式A 是临时的，但前端 localStorage 会持久化）
      globalThis._userLibraries.set(username, {
        favorites: Array.isArray(data.favorites) ? data.favorites : [],
        playlists: Array.isArray(data.playlists) ? data.playlists : [],
        updatedAt: Date.now()
      });

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('PUT library error:', error);
      return new Response(JSON.stringify({ error: 'Failed to save library' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // 其他方法
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' }
  });
}
