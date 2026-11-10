import { injectIntoInlineEditingControlHeader } from '@elementor/editor-controls';

import { AngieTextAction } from './text/angie-text-action';

export function init(): void {
	injectIntoInlineEditingControlHeader( {
		id: 'angie-text-action',
		component: AngieTextAction,
	} );
}
