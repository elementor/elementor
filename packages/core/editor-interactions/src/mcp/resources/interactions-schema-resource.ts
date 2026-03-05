import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { isProActive } from '@elementor/utils';

import { baseSchema, proSchema } from '../tools/schema';

export const INTERACTIONS_SCHEMA_URI = 'elementor://interactions/schema';

export const initInteractionsSchemaResource = ( reg: MCPRegistryEntry ) => {
	const { resource } = reg;
	const schema = isProActive() ? { ...baseSchema, ...proSchema } : baseSchema;

	resource(
		'interactions-schema',
		INTERACTIONS_SCHEMA_URI,
		{
			description: 'Schema describing all available options for element interactions.',
		},
		async () => {
			return {
				contents: [
					{
						uri: INTERACTIONS_SCHEMA_URI,
						mimeType: 'application/json',
						text: JSON.stringify( schema ),
					},
				],
			};
		}
	);
};
