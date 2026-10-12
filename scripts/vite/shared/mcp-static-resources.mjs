import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export const MCP_STATIC_RESOURCES_DIR = 'modules/mcp/static-resources';

const REQUIRED_ABILITY_PROMPTS = [
	'build-composition.md',
	'create-preview-link.md',
	'find-icons.md',
	'get-widget-schema.md',
	'list-assets.md',
	'list-components.md',
	'list-posts.md',
	'list-resources.md',
	'list-widget-schemas.md',
	'manage-component.md',
	'read-resource.md',
];

const REQUIRED_RESOURCE_PROMPTS = [
	'style/best-practices.md',
	'wordpress/best-practices.md',
];

export function verifyMcpStaticResources( baseDir ) {
	const abilitiesDir = join( baseDir, MCP_STATIC_RESOURCES_DIR, 'abilities' );

	if ( ! existsSync( abilitiesDir ) ) {
		throw new Error(
			`MCP static resources missing from plugin build: ${ join( MCP_STATIC_RESOURCES_DIR, 'abilities' ) }`,
		);
	}

	const packagedAbilities = readdirSync( abilitiesDir ).filter( ( fileName ) => fileName.endsWith( '.md' ) );

	for ( const fileName of REQUIRED_ABILITY_PROMPTS ) {
		if ( ! packagedAbilities.includes( fileName ) ) {
			throw new Error(
				`MCP ability prompt missing from plugin build: ${ join( MCP_STATIC_RESOURCES_DIR, 'abilities', fileName ) }`,
			);
		}
	}

	for ( const relativePath of REQUIRED_RESOURCE_PROMPTS ) {
		const filePath = join( baseDir, MCP_STATIC_RESOURCES_DIR, relativePath );

		if ( ! existsSync( filePath ) ) {
			throw new Error( `MCP static resource missing from plugin build: ${ join( MCP_STATIC_RESOURCES_DIR, relativePath ) }` );
		}
	}
}
