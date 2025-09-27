import { NextRequest } from 'next/server';

// Simple Auth0 route handler for App Router
export async function GET(request: NextRequest) {
  const { pathname } = new URL(request.url);
  
  // Extract the auth action from the path
  const pathSegments = pathname.split('/');
  const action = pathSegments[pathSegments.length - 1];
  
  // Redirect to Auth0 based on the action
  switch (action) {
    case 'login':
      // Redirect to Auth0 login
      return Response.redirect(`${process.env.AUTH0_ISSUER_BASE_URL}/authorize?response_type=code&client_id=${process.env.AUTH0_CLIENT_ID}&redirect_uri=${process.env.AUTH0_BASE_URL}/api/auth/callback&scope=openid profile email`);
    
    case 'logout':
      // Redirect to Auth0 logout
      return Response.redirect(`${process.env.AUTH0_ISSUER_BASE_URL}/v2/logout?client_id=${process.env.AUTH0_CLIENT_ID}&returnTo=${process.env.AUTH0_BASE_URL}`);
    
    case 'callback':
      // Handle the Auth0 callback
      return Response.redirect('/dashboard');
    
    default:
      return new Response('Not Found', { status: 404 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
