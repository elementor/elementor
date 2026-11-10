import { injectIntoInlineEditorToolbar } from '@elementor/editor-controls';

import { AngieTextAction } from './text/angie-text-action';

export function init(): void {
	injectIntoInlineEditorToolbar( {
		id: 'angie-text-action',
		component: AngieTextAction,
	} );
}
