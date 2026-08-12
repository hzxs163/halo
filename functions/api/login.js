// POST /api/login - 用户登录（方式A：简单内存存储）
// 注意：方式A 的登录是轻量级的，用户数据不持久化
// 重启 Workers 后用户需要重新注册（但收藏数据在浏览器 localStorage 中）

// 简单内存存储（Workers 冷启动会清空，仅用于演示）
const users = new Map();

// 为了在多个请求间共享 users，使用 globalThis
if (!globalThis._users) {
  globalThis._users = new Map();
}

export async function onRequest(context) {
  const { request } = context;
  
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { username, password } = await request.json();
    
    if (!username || !password) {
      return new Response(JSON.stringify({ error: 'Username and password required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const users = globalThis._users;
    const user = users.get(username);
    
    if (!user || user.password !== password) {
      return new Response(JSON.stringify({ error: 'Invalid username or password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 登录成功，返回用户信息（方式A 不生成 JWT，用 session cookie 或简单 token）
    // CF Pages Functions 支持 Cookies
    const sessionId = crypto.randomUUID();
    if (!globalThis._sessions) {
      globalThis._sessions = new Map();
    }
    globalThis._sessions.set(sessionId, { username, createdAt: Date.now() });

    return new Response(JSON.stringify({ 
      username: user.username,
      sessionId 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `session=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ error: 'Login failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
