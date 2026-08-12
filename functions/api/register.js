// POST /api/register - 用户注册（使用 KV 存储）

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

    if (username.length < 3 || username.length > 20) {
      return new Response(JSON.stringify({ error: 'Username must be 3-20 characters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (password.length < 8) {
      return new Response(JSON.stringify({ error: 'Password must be at least 8 characters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 使用 KV 存储
    const kv = env.USERS_KV;
    const existing = await kv.get(`user:${username}`);
    
    if (existing) {
      return new Response(JSON.stringify({ error: 'Username already exists' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 存储用户信息（方式A：仍为演示目的，生产环境请哈希密码）
    await kv.put(`user:${username}`, JSON.stringify({ 
      username, 
      password,
      createdAt: Date.now() 
    }));

    return new Response(JSON.stringify({ 
      username,
      message: 'Registration successful'
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Register error:', error);
    return new Response(JSON.stringify({ error: 'Registration failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
