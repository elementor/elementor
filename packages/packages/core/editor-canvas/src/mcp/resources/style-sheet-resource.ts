import { type MCPRegistryEntry } from '@elementor/editor-mcp';

export const STYLE_SHEET_RAW_CSS_URI = 'elementor://style-sheet-raw-css';

export const initStyleSheetResource = ( reg: MCPRegistryEntry ) => {
	const { mcpServer } = reg;
	const variables = window.elementor?.config?.variable_raw_css || '';

	mcpServer.resource(
		'style-sheet-raw-css',
		STYLE_SHEET_RAW_CSS_URI,
		{ description: 'Raw CSS of the style sheet.' },
		async () => {
			return {
				contents: [
					{
						uri: STYLE_SHEET_RAW_CSS_URI,
						text: `# Style sheet raw CSS
                ${
					variables &&
					`
                # Variables are prefixed with '--' and then the variable name
                # Value to put in the schema is the variable ID that can be found in the global-variables resource
                ${ variables }
                `
				}
                `,
					},
				],
			};
		}
	);
};
