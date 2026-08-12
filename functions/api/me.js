// GET /api/me - 获取当前登录用户信息（静默处理未登录）

export async function onRequest(context) {
  const { request } = context;
  
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // 1. 从 Cookie 中获取 session ID
    const cookie = request.headers.get('Cookie') || '';
    const sessionMatch = cookie.match(/session=([^;]+)/);
    
    // 2. 如果没有 session ID，返回未登录状态 (200 OK)
    if (!sessionMatch || !globalThis._sessions) {
      return new Response(JSON.stringify({ 
        isAuthenticated: false,
        username: null 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 3. 根据 session ID 查找对应的用户
    const session = globalThis._sessions.get(sessionMatch[1]);
    
    // 4. 如果 session 无效或已过期，返回未登录状态 (200 OK)
    if (!session) {
      return new Response(JSON.stringify({ 
        isAuthenticated: false,
        username: null 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 5. session 有效，返回已登录用户信息
    return new Response(JSON.stringify({ 
      isAuthenticated: true,
      username: session.username 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    // 6. 发生异常时，也返回未登录状态，避免前端报错
    console.error('Me endpoint error:', error);
    return new Response(JSON.stringify({ 
      isAuthenticated: false,
      username: null,
      error: 'Failed to get user info'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
