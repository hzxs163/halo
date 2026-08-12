// GET/PUT /api/library - 用户收藏和歌单（使用 KV 存储）

export async function onRequest(context) {
  const { request, env } = context;
  
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
  const kv = env.USERS_KV;
  const libraryKey = `library:${username}`;

  // GET: 获取用户数据
  if (request.method === 'GET') {
    const libraryData = await kv.get(libraryKey);
    const library = libraryData ? JSON.parse(libraryData) : {
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
      
      if (!data || typeof data !== 'object') {
        return new Response(JSON.stringify({ error: 'Invalid library data' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      await kv.put(libraryKey, JSON.stringify({
        favorites: Array.isArray(data.favorites) ? data.favorites : [],
        playlists: Array.isArray(data.playlists) ? data.playlists : [],
        updatedAt: Date.now()
      }));

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

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' }
  });
}
