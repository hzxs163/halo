// POST /api/logout - 退出登录

export async function onRequest(context) {
  const { request } = context;
  
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // 清除 session
    const cookie = request.headers.get('Cookie') || '';
    const sessionMatch = cookie.match(/session=([^;]+)/);
    if (sessionMatch && globalThis._sessions) {
      globalThis._sessions.delete(sessionMatch[1]);
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
      }
    });
  } catch (error) {
    console.error('Logout error:', error);
    return new Response(JSON.stringify({ error: 'Logout failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
