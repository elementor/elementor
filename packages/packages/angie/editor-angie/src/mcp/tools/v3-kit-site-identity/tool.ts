import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { z } from '@elementor/schema';

import { handleKitSiteIdentityTool } from './handler';

const siteIdentityFieldSchema = z.enum( [ 'site_description', 'site_favicon', 'site_logo', 'site_name' ] );

const mediaPatchSchema = z.object( {
	id: z.number(),
	url: z.string().optional(),
} );

export const initV3KitSiteIdentityTool = ( reg: MCPRegistryEntry ): void => {
	const { addTool } = reg;

	addTool( {
		name: 'v3-kit-site-identity',
		description:
			'Read or update Site Identity kit settings (site name, description, logo, favicon). Uses the active kit document container.',
		schema: {
			action: z
				.enum( [ 'get', 'set' ] )
				.describe( 'get returns selected fields; set applies a patch (one undo step).' ),
			fields: z
				.array( siteIdentityFieldSchema )
				.optional()
				.describe( 'Fields to return for get. Defaults to all site identity fields.' ),
			patch: z
				.object( {
					site_name: z.string().optional(),
					site_description: z.string().optional(),
					site_logo: mediaPatchSchema.optional(),
					site_favicon: mediaPatchSchema.optional(),
				} )
				.optional()
				.describe( 'Site identity values to apply. Required for set with at least one field.' ),
		},
		outputSchema: {
			success: z.boolean().optional(),
			site_name: z.string().optional(),
			site_description: z.string().optional(),
			site_logo: mediaPatchSchema.optional(),
			site_favicon: mediaPatchSchema.optional(),
		},
		isDestructive: true,
		handler: handleKitSiteIdentityTool,
	} );
};