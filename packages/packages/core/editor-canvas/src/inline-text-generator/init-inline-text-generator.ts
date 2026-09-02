import { injectIntoInlineEditorToolbarActions } from '@elementor/editor-controls';

import { InlineTextGeneratorToolbarAction } from './inline-text-generator-toolbar-action';

export const initInlineTextGenerator = () => {
	injectIntoInlineEditorToolbarActions( {
		id: 'inline-text-generator',
		component: InlineTextGeneratorToolbarAction,
	} );
};
