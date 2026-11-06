import { type APIRequestContext, expect } from '@playwright/test';
import { wpCli } from '../../../assets/wp-cli';
import { McpClient } from './mcp-client';

// The wp-lite-env Docker setup mounts tests/playwright at <WordPress root>/elementor-playwright; the playground mounts the whole plugin.
const FIXTURES_DIR = 'playground' === process.env.WP_CLI_TARGET
	? '/wordpress/wp-content/plugins/elementor/tests/playwright/sanity/modules/editor-mcp/fixtures'
	: 'elementor-playwright/sanity/modules/editor-mcp/fixtures';

// Playground auto-logs-in any visitor without this cookie, so anonymous frontend checks send it.
const ANONYMOUS_HEADERS = { Cookie: 'playground_auto_login_already_happened=1', 'Cache-Control': 'no-cache' };

export async function setMcpAbilitiesEnabled( enabled: boolean ): Promise<void> {
	await wpCli( `wp option update elementor_mcp_enabled ${ enabled ? 1 : 0 }` );
}

export async function createPage( mcp: McpClient, title: string ): Promise<number> {
	const result = await mcp.callToolOrThrow( 'elementor/create-page', { title } );

	return Number( result.id );
}

export async function buildComposition( mcp: McpClient, args: Record<string, unknown> ) {
	return mcp.callToolOrThrow( 'elementor/build-composition', args );
}

export async function publish( mcp: McpClient, postId: number ) {
	return mcp.callToolOrThrow( 'elementor/publish-document', { post_id: postId } );
}

// Maps configuration-id → element id from a build-composition resolved_xml.
export function resolvedIds( result: Record<string, unknown> ): Record<string, string> {
	const ids: Record<string, string> = {};

	for ( const match of String( result.resolved_xml ).matchAll( /configuration-id="([^"]+)" id="([^"]+)"/g ) ) {
		ids[ match[ 1 ] ] = match[ 2 ];
	}

	return ids;
}

// Seeds raw Elementor data, for elements MCP cannot create (V3 widgets, e-flexbox).
export async function setElementorData( postId: number, data: unknown[] ): Promise<void> {
	const json = Buffer.from( JSON.stringify( data ) ).toString( 'base64' );

	await wpCli( `wp eval-file ${ FIXTURES_DIR }/set-elementor-data.php ${ postId } ${ json }` );
	await wpCli( `wp post update ${ postId } --post_status=publish` );
	await wpCli( 'wp elementor flush-css' );
}

export async function getFrontendHtml( request: APIRequestContext, baseUrl: string, postId: number ): Promise<string> {
	const response = await request.get( `${ baseUrl }/?page_id=${ postId }`, { headers: ANONYMOUS_HEADERS } );

	expect( response.ok() ).toBeTruthy();

	return response.text();
}
