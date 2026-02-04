/**
 * Cloudflare Pages Function - HuggingFace API Proxy
 *
 * Proxies requests to HuggingFace API to avoid CORS issues.
 * All requests to /api/* are forwarded to huggingface.co/api/*
 * All requests to /api/inference/* are converted to the new chat completions API
 */

interface Env {
  VITE_HF_TOKEN?: string;
}

const HF_API_BASE = 'https://huggingface.co/api';
const HF_CHAT_COMPLETIONS = 'https://router.huggingface.co/v1/chat/completions';
const HF_SERVERLESS_INFERENCE = 'https://api-inference.huggingface.co/models';

// Models that should use chat completions API (text generation models)
const CHAT_MODELS = new Set(['gpt2', 'gpt2-medium', 'gpt2-large', 'gpt2-xl', 'distilgpt2']);

// Map chat model IDs to new ones available in Inference Providers
const CHAT_MODEL_MAPPING: Record<string, string> = {
  gpt2: 'meta-llama/Llama-3.2-1B-Instruct',
  'gpt2-medium': 'meta-llama/Llama-3.2-3B-Instruct',
  'gpt2-large': 'meta-llama/Llama-3.3-70B-Instruct',
  'gpt2-xl': 'meta-llama/Llama-3.3-70B-Instruct',
  distilgpt2: 'meta-llama/Llama-3.2-1B-Instruct',
};

export async function onRequest(context: {
  request: Request;
  env: Env;
  params: { path: string[] };
}) {
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
    const pathSegments = params.path || [];

    // Handle inference requests
    if (pathSegments[0] === 'inference' && request.method === 'POST') {
      const modelId = pathSegments.slice(1).join('/');
      const oldBody = (await request.json()) as any;

      // Get auth token
      const authHeader = request.headers.get('Authorization');
      const token = authHeader?.replace('Bearer ', '') || env.VITE_HF_TOKEN;

      if (!token) {
        return new Response(JSON.stringify({ error: 'No authorization token provided' }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // Use chat completions API for text generation models
      if (CHAT_MODELS.has(modelId)) {
        const newModelId = CHAT_MODEL_MAPPING[modelId] || modelId;

        // Convert old format to chat completions format
        const prompt =
          typeof oldBody.inputs === 'string' ? oldBody.inputs : JSON.stringify(oldBody.inputs);

        const newBody = {
          model: newModelId,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: oldBody.parameters?.max_new_tokens || oldBody.parameters?.max_length || 100,
          temperature: oldBody.parameters?.temperature || 0.7,
          stream: false,
        };

        const response = await fetch(HF_CHAT_COMPLETIONS, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newBody),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          console.error(`Chat completions error: ${response.status} ${response.statusText}`);
          console.error(`Error body: ${errorBody.substring(0, 500)}`);

          return new Response(errorBody, {
            status: response.status,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        }

        const chatResponse = (await response.json()) as any;

        // Convert back to old format for backward compatibility
        const oldFormatResponse = [
          {
            generated_text: chatResponse.choices?.[0]?.message?.content || '',
          },
        ];

        return new Response(JSON.stringify(oldFormatResponse), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // Use serverless inference API for other models (classification, etc.)
      const targetUrl = `${HF_SERVERLESS_INFERENCE}/${modelId}`;

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(oldBody),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Serverless inference error: ${response.status} ${response.statusText}`);
        console.error(`Error body: ${errorBody.substring(0, 500)}`);
      }

      const responseHeaders = new Headers(response.headers);
      responseHeaders.set('Access-Control-Allow-Origin', '*');
      responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    }

    // Regular API requests (non-inference)
    const apiPath = pathSegments.join('/');
    const targetUrl = `${HF_API_BASE}/${apiPath}${url.search}`;

    const headers = new Headers();
    headers.set('Content-Type', request.headers.get('Content-Type') || 'application/json');

    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      headers.set('Authorization', authHeader);
    } else if (env.VITE_HF_TOKEN) {
      headers.set('Authorization', `Bearer ${env.VITE_HF_TOKEN}`);
    }

    headers.set('User-Agent', 'Cloudflare-Pages-Proxy/1.0');

    const proxyRequest = new Request(targetUrl, {
      method: request.method,
      headers,
      body:
        request.method !== 'GET' && request.method !== 'HEAD'
          ? await request.arrayBuffer()
          : undefined,
    });

    const response = await fetch(proxyRequest);

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
    console.error('Proxy error:', error);
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
