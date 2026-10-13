import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const BASE_URL = process.env.PLAYGROUND_URL ?? 'http://127.0.0.1:9400';
const ARTIFACTS = process.env.MCP_POC_ARTIFACTS ?? '/opt/cursor/artifacts';
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'password';
const MCP_ENDPOINT = `${ BASE_URL }/wp-json/elementor/mcp`;

const transcript = [];

function record( label, payload ) {
	transcript.push( {
		at: new Date().toISOString(),
		label,
		...payload,
	} );
}

async function parseJson( response, context ) {
	const text = await response.text();
	try {
		return JSON.parse( text );
	} catch {
		throw new Error( `${ context }: expected JSON, got ${ response.status } ${ text.slice( 0, 500 ) }` );
	}
}

function cookieHeader( jar ) {
	return Object.entries( jar )
		.map( ( [ k, v ] ) => `${ k }=${ v }` )
		.join( '; ' );
}

function storeSetCookie( jar, setCookie ) {
	if ( ! setCookie ) {
		return;
	}
	const parts = Array.isArray( setCookie ) ? setCookie : [ setCookie ];
	for ( const line of parts ) {
		const [ pair ] = line.split( ';' );
		const eq = pair.indexOf( '=' );
		if ( eq > 0 ) {
			jar[ pair.slice( 0, eq ).trim() ] = pair.slice( eq + 1 );
		}
	}
}

async function wpSession() {
	const jar = {};
	const body = new URLSearchParams( {
		log: ADMIN_USER,
		pwd: ADMIN_PASS,
		'wp-submit': 'Log In',
		redirect_to: `${ BASE_URL }/wp-admin/`,
		testcookie: '1',
	} );
	const loginResponse = await fetch( `${ BASE_URL }/wp-login.php`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body,
		redirect: 'manual',
	} );
	storeSetCookie( jar, loginResponse.headers.getSetCookie?.() ?? loginResponse.headers.get( 'set-cookie' ) );
	record( 'wp-login', {
		request: { method: 'POST', url: `${ BASE_URL }/wp-login.php` },
		response: { status: loginResponse.status },
	} );

	const nonceResponse = await fetch( `${ BASE_URL }/wp-admin/admin-ajax.php?action=rest-nonce`, {
		headers: { Cookie: cookieHeader( jar ) },
	} );
	const nonce = ( await nonceResponse.text() ).trim();
	record( 'rest-nonce', {
		request: { url: `${ BASE_URL }/wp-admin/admin-ajax.php?action=rest-nonce` },
		response: { status: nonceResponse.status, body: nonce },
	} );

	return { jar, nonce };
}

let sessionId = null;
let protocolVersion = '2025-03-26';
let requestId = 0;

async function mcpCall( session, method, params = {} ) {
	const id = ++requestId;
	const requestBody = {
		jsonrpc: '2.0',
		id,
		method,
		params,
	};
	const headers = {
		'Content-Type': 'application/json',
		Accept: 'application/json, text/event-stream',
		Cookie: cookieHeader( session.jar ),
		'X-WP-Nonce': session.nonce,
		'MCP-Protocol-Version': protocolVersion,
	};
	if ( sessionId ) {
		headers['Mcp-Session-Id'] = sessionId;
	}
	const response = await fetch( MCP_ENDPOINT, {
		method: 'POST',
		headers,
		body: JSON.stringify( requestBody ),
	} );
	const newSession = response.headers.get( 'mcp-session-id' ) ?? response.headers.get( 'Mcp-Session-Id' );
	if ( newSession ) {
		sessionId = newSession;
	}
	const body = await parseJson( response, `mcp ${ method }` );
	record( 'mcp', { request: requestBody, response: { status: response.status, sessionId, body } } );
	if ( body.error ) {
		throw new Error( `${ method } failed: ${ JSON.stringify( body.error ) }` );
	}
	if ( body.result?.isError ) {
		const errText = body.result.content?.[ 0 ]?.text ?? JSON.stringify( body.result );
		throw new Error( `${ method } tool error: ${ errText }` );
	}
	return body.result;
}

function toolResultJson( result ) {
	const text = result?.content?.[ 0 ]?.text;
	if ( ! text ) {
		return result;
	}
	try {
		return JSON.parse( text );
	} catch {
		return { raw: text };
	}
}

async function main() {
	await mkdir( ARTIFACTS, { recursive: true } );

	const session = await wpSession();

	const initResult = await mcpCall( session, 'initialize', {
		protocolVersion,
		capabilities: {},
		clientInfo: { name: 'mcp-poc-script', version: '1.0.0' },
	} );
	protocolVersion = initResult.protocolVersion ?? protocolVersion;

	const toolsList = await mcpCall( session, 'tools/list', {} );
	const toolNames = ( toolsList.tools ?? [] ).map( ( t ) => t.name );
	record( 'tools-list-summary', {
		response: {
			toolCount: toolNames.length,
			elementorTools: toolNames.filter( ( n ) => n.startsWith( 'elementor' ) ),
		},
	} );

	const required = [ 'elementor-create-page', 'elementor-build-composition', 'elementor-publish-document' ];
	for ( const name of required ) {
		if ( ! toolNames.includes( name ) ) {
			throw new Error( `Missing tool ${ name }. Elementor tools: ${ toolNames.filter( ( n ) => n.startsWith( 'elementor' ) ).join( ', ' ) }` );
		}
	}

	const widget = process.env.MCP_POC_WIDGET ?? 'counter';
	const scenarios = {
		counter: {
			pageTitle: 'MCP Counter POC',
			xml_structure: '<counter configuration-id="c1"/>',
			element_config: {
				c1: {
					starting_number: '0',
					ending_number: '750',
					title: 'Projects delivered',
					suffix: '+',
					duration: '2000',
				},
			},
			style: {
				c1: 'font-size: 40px; color: #0d47a1; title { font-size: 16px; color: #546e7a; }',
			},
			renderMarker: 'elementor-counter',
		},
		'nav-menu': {
			pageTitle: 'MCP Nav Menu POC',
			xml_structure: '<nav-menu configuration-id="nav1"/>',
			element_config: {},
			style: {
				nav1: 'font-size: 16px; color: #1a1a1a;',
			},
			renderMarker: 'elementor-widget-nav-menu',
		},
	};
	const scenario = scenarios[ widget ];
	if ( ! scenario ) {
		throw new Error( `Unknown MCP_POC_WIDGET: ${ widget }` );
	}

	if ( 'nav-menu' === widget ) {
		const menus = await fetch( `${ BASE_URL }/wp-json/wp/v2/menus`, {
			headers: { Cookie: cookieHeader( session.jar ), 'X-WP-Nonce': session.nonce },
		} ).then( ( r ) => parseJson( r, 'menus' ) );
		const menuId = String( menus?.[ 0 ]?.id ?? '1' );
		scenario.element_config = {
			nav1: { menu: menuId, layout: 'horizontal' },
		};
	}

	const createRaw = await mcpCall( session, 'tools/call', {
		name: 'elementor-create-page',
		arguments: { title: scenario.pageTitle },
	} );
	const createPayload = toolResultJson( createRaw );
	const postId = createPayload.id;
	if ( ! postId ) {
		throw new Error( `create-page returned no id: ${ JSON.stringify( createPayload ) }` );
	}

	const buildRaw = await mcpCall( session, 'tools/call', {
		name: 'elementor-build-composition',
		arguments: {
			post_id: postId,
			xml_structure: scenario.xml_structure,
			element_config: scenario.element_config,
			style: scenario.style,
		},
	} );
	const buildPayload = toolResultJson( buildRaw );
	if ( ! buildPayload.success ) {
		throw new Error( `build-composition failed: ${ JSON.stringify( buildPayload ) }` );
	}

	const publishRaw = await mcpCall( session, 'tools/call', {
		name: 'elementor-publish-document',
		arguments: { post_id: postId },
	} );
	const publishPayload = toolResultJson( publishRaw );

	const previewUrl = publishPayload.preview_url ?? `${ BASE_URL }/?p=${ postId }`;
	await writeFile( join( ARTIFACTS, 'mcp-poc-preview-url.txt' ), previewUrl );
	await writeFile( join( ARTIFACTS, 'mcp-poc-post-id.txt' ), String( postId ) );
	await writeFile( join( ARTIFACTS, 'mcp-transcript.json' ), JSON.stringify( transcript, null, 2 ) );

	let md = '# MCP POC transcript\n\n';
	for ( const entry of transcript ) {
		md += `## ${ entry.label } (${ entry.at })\n\n`;
		if ( entry.request ) {
			md += '### Request\n\n```json\n' + JSON.stringify( entry.request, null, 2 ) + '\n```\n\n';
		}
		if ( entry.response ) {
			md += '### Response\n\n```json\n' + JSON.stringify( entry.response, null, 2 ) + '\n```\n\n';
		}
	}
	await writeFile( join( ARTIFACTS, 'mcp-transcript.md' ), md );

	await writeFile( join( ARTIFACTS, 'mcp-poc-widget.txt' ), widget );
	await writeFile( join( ARTIFACTS, 'mcp-poc-render-marker.txt' ), scenario.renderMarker );
	console.log( JSON.stringify( { postId, previewUrl, widget }, null, 2 ) );
}

main().catch( ( err ) => {
	console.error( err );
	process.exit( 1 );
} );
