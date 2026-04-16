import http from 'node:http';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { WpClient, type AuthContext } from './lib/wp-client.js';
import { resolveAuth } from './middleware/auth.js';
import { registerListPages } from './tools/list-pages.js';
import { registerGetDocument } from './tools/get-document.js';
import { registerApplyPatch } from './tools/apply-patch.js';
import { registerSaveDraft } from './tools/save-draft.js';

const WP_SITE_URL = process.env['WP_SITE_URL'] ?? 'http://baba-site-3.local:10008';
const WP_PUBLIC_URL = process.env['WP_PUBLIC_URL'] ?? WP_SITE_URL;
// Public URL of this MCP server (e.g. ngrok URL). Used in OAuth discovery metadata.
const MCP_PUBLIC_URL = (process.env['MCP_PUBLIC_URL'] ?? 'http://localhost:8787').replace(/\/$/, '');
const PORT = parseInt(process.env['PORT'] ?? '8787', 10);

const wpClient = new WpClient(WP_SITE_URL);

function createMcpServer(auth: AuthContext): McpServer {
	const server = new McpServer({
		name: 'elementor-mcp-server',
		version: '0.1.0',
	});

	const getAuth = () => auth;

	registerListPages(server, wpClient, getAuth);
	registerGetDocument(server, wpClient, getAuth);
	registerApplyPatch(server, wpClient, getAuth);
	registerSaveDraft(server, wpClient, getAuth);

	return server;
}

const httpServer = http.createServer(async (req, res) => {
	const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);

	// CORS headers — ChatGPT needs these.
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Mcp-Session-Id');
	res.setHeader('Access-Control-Expose-Headers', 'Mcp-Session-Id');

	if (req.method === 'OPTIONS') {
		res.writeHead(204).end();
		return;
	}

	if (req.method === 'GET' && url.pathname === '/') {
		res.writeHead(200, { 'Content-Type': 'text/plain' });
		res.end('elementor-mcp-server');
		return;
	}

	// RFC 8414 OAuth 2.0 Authorization Server Metadata — required by ChatGPT Apps SDK.
	if (req.method === 'GET' && (
		url.pathname === '/.well-known/oauth-authorization-server' ||
		url.pathname === '/.well-known/openid-configuration'
	)) {
		const metadata = {
			issuer: MCP_PUBLIC_URL,
			// Authorization happens on WP (user's browser — localtunnel bypass is clickable).
			authorization_endpoint: `${WP_PUBLIC_URL}/wp-admin/admin.php?page=elementor-oauth-authorize`,
			// Token exchange is proxied here so ChatGPT's backend doesn't hit localtunnel.
			token_endpoint: `${MCP_PUBLIC_URL}/oauth/token`,
			token_endpoint_auth_methods_supported: ['client_secret_post'],
			response_types_supported: ['code'],
			grant_types_supported: ['authorization_code'],
			scopes_supported: ['openid'],
		};
		res.writeHead(200, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify(metadata));
		return;
	}

	// RFC 9728 OAuth 2.0 Protected Resource Metadata.
	if (req.method === 'GET' && url.pathname === '/.well-known/oauth-protected-resource') {
		const metadata = {
			resource: MCP_PUBLIC_URL,
			authorization_servers: [MCP_PUBLIC_URL],
		};
		res.writeHead(200, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify(metadata));
		return;
	}

	// Proxy token exchange to WP locally — avoids localtunnel bypass page for server-to-server calls.
	if (req.method === 'POST' && url.pathname === '/oauth/token') {
		const chunks: Buffer[] = [];
		for await (const chunk of req) {
			chunks.push(chunk as Buffer);
		}
		const body = Buffer.concat(chunks).toString('utf8');

		console.log('[token] exchanging code, body:', body);

		const wpTokenUrl = `${WP_SITE_URL.replace(/\/$/, '')}/wp-json/elementor/v1/oauth/token`;
		const wpRes = await fetch(wpTokenUrl, {
			method: 'POST',
			headers: { 'Content-Type': req.headers['content-type'] ?? 'application/json' },
			body,
		});

		const responseBody = await wpRes.text();
		console.log('[token] WP response:', wpRes.status, responseBody);
		res.writeHead(wpRes.status, { 'Content-Type': 'application/json' });
		res.end(responseBody);
		return;
	}

	if (url.pathname === '/mcp') {
		console.log('[mcp] method:', req.method, '| auth header:', req.headers['authorization']?.slice(0, 30) + '...');
		// Resolve auth from Bearer token via WP introspect.
		const auth = await resolveAuth(req);

		if (!auth) {
			res.writeHead(401, {
				'Content-Type': 'application/json',
				'WWW-Authenticate': `Bearer realm="${MCP_PUBLIC_URL}", error="invalid_token"`,
			});
			res.end(JSON.stringify({ error: 'Unauthorized', message: 'Valid Bearer token required.' }));
			return;
		}

		// Each request gets its own stateless transport + server instance.
		const transport = new StreamableHTTPServerTransport({
			sessionIdGenerator: undefined, // stateless
		});

		const server = createMcpServer(auth);
		await server.connect(transport);

		// Buffer the request body before handing off.
		const chunks: Buffer[] = [];
		for await (const chunk of req) {
			chunks.push(chunk as Buffer);
		}
		const body = Buffer.concat(chunks).toString('utf8');

		await transport.handleRequest(req, res, body ? JSON.parse(body) : undefined);
		return;
	}

	res.writeHead(404, { 'Content-Type': 'application/json' });
	res.end(JSON.stringify({ error: 'Not found' }));
});

httpServer.listen(PORT, () => {
	console.log(`elementor-mcp-server listening on http://localhost:${PORT}/mcp`);
	console.log(`WP site (local): ${WP_SITE_URL}`);
	console.log(`WP public URL (authorize page): ${WP_PUBLIC_URL}`);
	console.log(`MCP public URL: ${MCP_PUBLIC_URL}`);
});
