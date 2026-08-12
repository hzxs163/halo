// POST /api/login - 用户登录（使用 KV 存储）

export async function onRequest(context) {
  const { request, env } = context;
  
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

    const kv = env.USERS_KV;
    
    // 调试：检查 KV 是否存在
    if (!kv) {
      console.error('USERS_KV binding is undefined');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 从 KV 读取用户数据
    const userKey = `user:${username}`;
    console.log(`Looking for key: ${userKey}`);
    
    const userData = await kv.get(userKey);
    console.log(`User data found: ${userData ? 'yes' : 'no'}`);
    
    if (!userData) {
      return new Response(JSON.stringify({ error: 'Invalid username or password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const user = JSON.parse(userData);
    
    // 验证密码
    if (user.password !== password) {
      return new Response(JSON.stringify({ error: 'Invalid username or password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 创建 session
    const sessionId = crypto.randomUUID();
    if (!globalThis._sessions) {
      globalThis._sessions = new Map();
    }
    globalThis._sessions.set(sessionId, { username, createdAt: Date.now() });

    // 返回成功响应，并设置 Cookie
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
    return new Response(JSON.stringify({ error: 'Login failed: ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
