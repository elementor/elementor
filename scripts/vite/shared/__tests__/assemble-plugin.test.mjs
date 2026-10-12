import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getPluginFiles } from '../../assemble-plugin.mjs';
import { MCP_STATIC_RESOURCES_DIR } from '../mcp-static-resources.mjs';

describe( 'getPluginFiles', () => {
	it( 'includes MCP static resource prompts required for ability registration', () => {
		const files = getPluginFiles();
		const staticResources = files.filter( ( file ) => file.startsWith( `${ MCP_STATIC_RESOURCES_DIR }/` ) );

		assert.ok( staticResources.length > 0, 'expected MCP static-resources files in the plugin artifact' );
		assert.ok(
			files.includes( `${ MCP_STATIC_RESOURCES_DIR }/abilities/build-composition.md` ),
			'build-composition prompt must ship so build-composition ability registers',
		);
		assert.ok(
			files.includes( `${ MCP_STATIC_RESOURCES_DIR }/style/best-practices.md` ),
			'style best-practices resource must ship in the plugin artifact',
		);
	} );

	it( 'does not ship repository markdown outside MCP static resources', () => {
		const files = getPluginFiles();
		const markdownFiles = files.filter( ( file ) => file.endsWith( '.md' ) );

		assert.deepEqual(
			markdownFiles.every( ( file ) => file.startsWith( `${ MCP_STATIC_RESOURCES_DIR }/` ) ),
			true,
			`unexpected markdown in plugin artifact: ${ markdownFiles.filter( ( file ) => ! file.startsWith( `${ MCP_STATIC_RESOURCES_DIR }/` ) ).join( ', ' ) }`,
		);
	} );
} );
