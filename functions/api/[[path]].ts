/**
 * Cloudflare Pages Function - HuggingFace API Proxy
 * 
 * Proxies requests to HuggingFace API to avoid CORS issues.
 * All requests to /api/* are forwarded to huggingface.co/api/*
 * All requests to /api/inference/* are forwarded to api-inference.huggingface.co/models/*
 */

interface Env {
  VITE_HF_TOKEN?: string;
}

const HF_API_BASE = 'https://huggingface.co/api';
const HF_INFERENCE_BASE = 'https://api-inference.huggingface.co/models';

export async function onRequest(context: { request: Request; env: Env; params: { path: string[] } }) {
  const { request, env, params } = context;
  const url = new URL(request.url);
  
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  try {
    // Build the target URL
    const pathSegments = params.path || [];
    let targetUrl: string;

    if (pathSegments[0] === 'inference') {
      // Inference API: /api/inference/model-name -> https://api-inference.huggingface.co/models/model-name
      const modelPath = pathSegments.slice(1).join('/');
      targetUrl = `${HF_INFERENCE_BASE}/${modelPath}${url.search}`;
    } else {
      // Regular API: /api/models -> https://huggingface.co/api/models
      const apiPath = pathSegments.join('/');
      targetUrl = `${HF_API_BASE}/${apiPath}${url.search}`;
    }

    // Forward headers
    const headers = new Headers();
    headers.set('Content-Type', request.headers.get('Content-Type') || 'application/json');

    // Add authorization token from request or environment
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      headers.set('Authorization', authHeader);
    } else if (env.VITE_HF_TOKEN) {
      headers.set('Authorization', `Bearer ${env.VITE_HF_TOKEN}`);
    }

    // Forward user-agent
    headers.set('User-Agent', 'Cloudflare-Pages-Proxy/1.0');

    // Make the proxied request
    const proxyRequest = new Request(targetUrl, {
      method: request.method,
      headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.arrayBuffer() : undefined,
    });

    const response = await fetch(proxyRequest);

    // Clone response to modify headers
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Proxy error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
