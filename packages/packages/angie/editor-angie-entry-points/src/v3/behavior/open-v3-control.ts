import { openAngieInAgentMode } from '@elementor/editor-mcp';

import type { AngieBehaviorView, BuildV3AngiePromptArgs, V3AngieControlContext } from '../types';

export function openV3ControlFromBehavior( view: AngieBehaviorView ): void {
	try {
		const buildPrompt = view.getOption( 'buildPrompt' ) as ( args: BuildV3AngiePromptArgs ) => string;
		const prompt = buildPrompt( {
			type: view.getOption( 'type' ) as string,
			controlType: view.getOption( 'controlType' ) as string,
			getControlValue: view.getOption( 'getControlValue' ) as () => unknown,
			context: ( view.getOption( 'context' ) as V3AngieControlContext ) || {},
			additionalOptions: view.getOption( 'additionalOptions' ) as BuildV3AngiePromptArgs[ 'additionalOptions' ],
		} );

		openAngieInAgentMode( prompt );
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( 'Failed to open Angie for V3 control:', error );
	}
}
