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
			'Read or update Site Identity on the active kit (site name, description, logo, favicon). Works from any open document. When Site Settings is the current document the change is applied live and is undoable; otherwise it is saved through the active kit settings REST API (elementor/v1/kits/active/settings) and is not undoable. Separate from update-elementor-kit-settings-colors-and-fonts / elementor-kit-mcp, which handle colors and fonts.',
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
