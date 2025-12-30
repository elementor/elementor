import { type MCPRegistryEntry } from '@elementor/editor-mcp';

export const STYLE_SHEET_RAW_CSS_URI = 'elementor://style-sheet-raw-css';

export const initStyleSheetResource = ( reg: MCPRegistryEntry ) => {
	const { mcpServer, sendResourceUpdated } = reg;
	window.addEventListener( 'elementor:loaded', () => {
		mcpServer.resource(
			'style-sheet-raw-css',
			STYLE_SHEET_RAW_CSS_URI,
			{ description: 'Raw CSS of the style sheet.' },
			async () => {
				return {
					contents: [
						{
							uri: STYLE_SHEET_RAW_CSS_URI,
							text: generateStyleSheetRawCSS(),
						},
					],
				};
			}
		);
		window.addEventListener( 'elementor:style-items-changed', () => {
			sendResourceUpdated( {
				uri: STYLE_SHEET_RAW_CSS_URI,
				contents: [
					{
						uri: STYLE_SHEET_RAW_CSS_URI,
						text: generateStyleSheetRawCSS(),
					},
				],
			} );
		} );
	} );
};

export const getRawGlobalClassesCSS = () => {
	const styles = window?.elementor
		?.getContainer?.( 'document' )
		?.document?.$element[ 0 ].ownerDocument.querySelectorAll( 'style[data-provider-key="global-classes"]' );
	return Array.from( styles ?? [] )
		.map( ( style ) => style.textContent?.replace( '.elementor ', '' ) )
		.join( '\n' );
};

export const generateStyleSheetRawCSS = () => {
	const variables = window.elementor?.config?.variable_raw_css ?? '';
	const classes = getRawGlobalClassesCSS();

	return `# Style sheet raw CSS
${
	variables &&
	`# Variables are prefixed with '--' and then the variable name
# Value to put in the schema is the variable ID that can be found in the global-variables resource
${ variables }
`
}

${
	classes &&
	`
# Classes are prefixed with '.' and then the class name
${ classes }
`
}`;
};
