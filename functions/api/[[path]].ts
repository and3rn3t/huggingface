/**
 * Cloudflare Pages Function - HuggingFace API Proxy
 *
 * Proxies POST /api/inference/* to HuggingFace inference (chat completions for text-gen models).
 * No other HF endpoints are exposed, and no CORS headers are sent (same-origin only).
 */

interface Env {
  VITE_HF_TOKEN?: string;
}

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

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export async function onRequest(context: {
  request: Request;
  env: Env;
  params: { path: string[] };
}) {
  const { request, env, params } = context;

  // Same-origin only: no CORS headers, so other sites can't use the server token from a browser.
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
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

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    }

    // Anything else (e.g. whoami-v2) is intentionally not proxied: the proxy
    // carries a server-side token, so it only exposes inference.
    return json({ error: 'Not found' }, 404);
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
        },
      }
    );
  }
}
