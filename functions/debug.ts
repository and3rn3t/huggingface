/**
 * Debug endpoint to check if environment variables are set
 */

interface Env {
  VITE_HF_TOKEN?: string;
}

export async function onRequest(context: { env: Env }) {
  const { env } = context;

  return new Response(
    JSON.stringify({
      hasToken: !!env.VITE_HF_TOKEN,
      tokenPrefix: env.VITE_HF_TOKEN ? env.VITE_HF_TOKEN.substring(0, 8) + '...' : null,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}
