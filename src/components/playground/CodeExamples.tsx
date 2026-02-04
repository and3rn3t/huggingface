import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface CodeExamplesProps {
  selectedModel: string;
  input: string;
  temperature: number;
  maxTokens: number;
}

export function CodeExamples({
  selectedModel,
  input,
  temperature,
  maxTokens,
}: CodeExamplesProps) {
  const copyCode = (lang: 'python' | 'javascript' | 'curl') => {
    const codes = {
      python: `# Python Example
import requests

API_URL = "https://api-inference.huggingface.co/models/${selectedModel}"
headers = {"Authorization": "Bearer YOUR_TOKEN"}

def query(payload):
    response = requests.post(API_URL, headers=headers, json=payload)
    return response.json()

output = query({
  "inputs": "${input.slice(0, 30)}...",
  "parameters": {
    "temperature": ${temperature},
    "max_tokens": ${maxTokens}
  }
})`,
      javascript: `// JavaScript Example
const API_URL = "https://api-inference.huggingface.co/models/${selectedModel}";

async function query(data) {
  const response = await fetch(
    API_URL, {
      headers: {
        Authorization: "Bearer TOKEN"
      },
      method: "POST",
      body: JSON.stringify(data)
    }
  );
  return await response.json();
}

const result = await query({
  inputs: "${input.slice(0, 30)}...",
  parameters: {
    temperature: ${temperature},
    max_tokens: ${maxTokens}
  }
});`,
      curl: `# cURL Example
curl https://api-inference.huggingface.co/models/${selectedModel} \\
  -X POST \\
  -H "Authorization: Bearer TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "inputs": "${input.slice(0, 30)}...",
    "parameters": {
      "temperature": ${temperature},
      "max_tokens": ${maxTokens}
    }
  }'`,
    };

    navigator.clipboard.writeText(codes[lang]);
    toast.success(`${lang.toUpperCase()} code copied!`);
  };

  return (
    <Card className="p-4">
      <h4 className="font-semibold mb-3 text-sm">Code Examples</h4>
      <Tabs defaultValue="python">
        <TabsList className="grid grid-cols-3 mb-3">
          <TabsTrigger value="python" className="text-xs">
            Python
          </TabsTrigger>
          <TabsTrigger value="javascript" className="text-xs">
            JavaScript
          </TabsTrigger>
          <TabsTrigger value="curl" className="text-xs">
            cURL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="python" className="space-y-2">
          <div className="flex justify-end">
            <Button size="sm" variant="ghost" onClick={() => copyCode('python')}>
              <Copy size={14} />
            </Button>
          </div>
          <Card className="p-3 bg-muted">
            <pre className="text-xs text-accent overflow-x-auto max-h-[400px] overflow-y-auto">
              {`# Python Example
import requests

API_URL = "https://api-inference...";
headers = {"Authorization": "Bearer YOUR_TOKEN"}

def query(payload):
    response = requests.post(
      API_URL, headers=headers, json=payload
    )
    return response.json()

output = query({
  "inputs": "${input.slice(0, 30)}...",
  "parameters": {
    "temperature": ${temperature},
    "max_tokens": ${maxTokens}
  }
})`}
            </pre>
          </Card>
        </TabsContent>

        <TabsContent value="javascript" className="space-y-2">
          <div className="flex justify-end">
            <Button size="sm" variant="ghost" onClick={() => copyCode('javascript')}>
              <Copy size={14} />
            </Button>
          </div>
          <Card className="p-3 bg-muted">
            <pre className="text-xs text-accent overflow-x-auto max-h-[400px] overflow-y-auto">
              {`// JavaScript Example
const API_URL = "https://api-inference...";

async function query(data) {
  const response = await fetch(
    API_URL, {
      headers: {
        Authorization: "Bearer TOKEN"
      },
      method: "POST",
      body: JSON.stringify(data)
    }
  );
  return await response.json();
}

const result = await query({
  inputs: "${input.slice(0, 30)}...",
  parameters: {
    temperature: ${temperature},
    max_tokens: ${maxTokens}
  }
});`}
            </pre>
          </Card>
        </TabsContent>

        <TabsContent value="curl" className="space-y-2">
          <div className="flex justify-end">
            <Button size="sm" variant="ghost" onClick={() => copyCode('curl')}>
              <Copy size={14} />
            </Button>
          </div>
          <Card className="p-3 bg-muted">
            <pre className="text-xs text-accent overflow-x-auto max-h-[400px] overflow-y-auto">
              {`# cURL Example
curl https://api-inference... \\
  -X POST \\
  -H "Authorization: Bearer TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "inputs": "${input.slice(0, 30)}...",
    "parameters": {
      "temperature": ${temperature},
      "max_tokens": ${maxTokens}
    }
  }'`}
            </pre>
          </Card>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
