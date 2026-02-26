import { type MCPRegistryEntry } from '@elementor/editor-mcp';

import { getInteractionsConfig } from '../../utils/get-interactions-config';

export const INTERACTIONS_SCHEMA_URI = 'elementor://interactions/schema';

export const initInteractionsSchemaResource = ( reg: MCPRegistryEntry ) => {
	const { resource } = reg;
	const { itemSchema } = getInteractionsConfig() ?? {};

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
						text: JSON.stringify( itemSchema ),
					},
				],
			};
		}
	);
};
