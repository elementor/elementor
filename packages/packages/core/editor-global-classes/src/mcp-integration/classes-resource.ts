import { getMCPByDomain } from '@elementor/editor-mcp';

export const GLOBAL_CLASSES_URI = 'elementor://classes';

export const initClassesResource = () => {
	const { mcpServer } = getMCPByDomain( 'classes' );

	mcpServer.resource(
		'global-classes',
		GLOBAL_CLASSES_URI,
		{
			description: 'Global classes list.',
		},
		async () => {
			return {
				contents: [ { uri: GLOBAL_CLASSES_URI, text: localStorage[ 'elementor-global-classes' ] ?? {} } ],
			};
		}
	);
};
