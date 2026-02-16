import { stylesRepository } from '@elementor/editor-styles-repository';
import { registerDataHook } from '@elementor/editor-v1-adapters';
import { __registerSlice as registerSlice } from '@elementor/store';

import { loadTemplatesStyles } from './load-templates-styles';
import { slice } from './store';
import { templatesStylesProvider } from './templates-styles-provider';

export function init() {
	registerSlice( slice );

	stylesRepository.register( templatesStylesProvider );

	registerDataHook( 'after', 'editor/documents/attach-preview', async () => {
		await loadTemplatesStyles();
	} );
}
