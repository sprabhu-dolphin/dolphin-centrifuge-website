// Minimal MCP client smoke test: node smoke-test.mjs [endpoint]
// Runs initialize, tools/list and the read-only tools. Never calls request_quote.
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const endpoint = process.argv[2] || 'http://127.0.0.1:8787/mcp';
const client = new Client({ name: 'dolphin-mcp-smoke', version: '1.0.0' });
await client.connect(new StreamableHTTPClientTransport(new URL(endpoint)));
const info = client.getServerVersion();
console.log('server:', info.name, info.version);
console.log('instructions:', client.getInstructions());
const { tools } = await client.listTools();
console.log('tools:', tools.map((t) => t.name).join(', '));

const calls = [
  ['get_centrifuge_specs', { model: 'MOPX 207' }],
  ['list_centrifuge_models', { type: 'decanter' }],
  ['check_dolphin_stock', {}],
  ['size_centrifuge', { bowl_diameter_m: 0.4064, rpm: 6000 }],
];
for (const [name, args] of calls) {
  const res = await client.callTool({ name, arguments: args });
  const text = res.content?.[0]?.text ?? '';
  console.log(`\n== ${name} ${JSON.stringify(args)} isError=${Boolean(res.isError)}\n${text.slice(0, 700)}${text.length > 700 ? '\n...' : ''}`);
  if (res.isError) process.exitCode = 1;
}
await client.close();
