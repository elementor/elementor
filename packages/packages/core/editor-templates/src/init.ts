import { injectIntoLogic } from '@elementor/editor';
import { stylesRepository } from '@elementor/editor-styles-repository';
import { registerDataHook } from '@elementor/editor-v1-adapters';
import { __registerSlice as registerSlice } from '@elementor/store';

import { loadTemplates, unloadTemplates } from './load-templates';
import { RenderTemplateStyles } from './render-template-styles';
import { slice } from './store';
import { clearTemplatesStyles, templatesStylesProvider } from './templates-styles-provider';

export function init() {
	registerSlice( slice );
	stylesRepository.register( templatesStylesProvider );

	registerDataHook( 'after', 'editor/documents/attach-preview', async () => {
		unloadTemplates();
		clearTemplatesStyles();

		await loadTemplates();
	} );

	injectIntoLogic( {
		id: 'templates-styles',
		component: RenderTemplateStyles,
	} );
}
