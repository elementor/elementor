import { openAngieInAgentMode } from '@elementor/editor-mcp';

import { buildAngieV3LayoutPrompt, type AngieV3LayoutPromptContext } from '../../prompts';

export function openAngieForV3Layout( context: AngieV3LayoutPromptContext ): void {
	try {
		openAngieInAgentMode( buildAngieV3LayoutPrompt( context ) );
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( 'Failed to open Angie for V3 layout:', error );
	}
}