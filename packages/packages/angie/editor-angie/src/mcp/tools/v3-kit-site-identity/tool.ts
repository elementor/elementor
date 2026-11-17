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
			'Read or update Site Identity on the active kit (site name, description, logo, favicon). Writes live kit editor state via document/elements/settings (undoable). Site Settings / the kit document must be open as the current document. Intentionally separate from update-elementor-kit-settings-colors-and-fonts / elementor-kit-mcp, which patch via REST /angie/v1/elementor-kit for colors, fonts, and optional patchObject. Prefer this tool for Site Identity logo spark flows when the kit panel is open.',
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
