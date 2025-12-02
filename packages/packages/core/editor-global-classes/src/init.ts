import { injectIntoLogic } from '@elementor/editor';
import {
	injectIntoClassSelectorActions,
	injectIntoCssClassConvert,
	registerStyleProviderToColors,
} from '@elementor/editor-editing-panel';
import { __registerPanel as registerPanel } from '@elementor/editor-panels';
import { stylesRepository } from '@elementor/editor-styles-repository';
import { __registerSlice as registerSlice } from '@elementor/store';

import { ClassManagerButton } from './components/class-manager/class-manager-button';
import { panel } from './components/class-manager/class-manager-panel';
import { ConvertLocalClassToGlobalClass } from './components/convert-local-class-to-global-class';
import { PopulateStore } from './components/populate-store';
import { GLOBAL_CLASSES_PROVIDER_KEY, globalClassesStylesProvider } from './global-classes-styles-provider';
import { PrefetchCssClassUsage } from './hooks/use-prefetch-css-class-usage';
import { initMcpIntegration } from './mcp-integration';
import { slice } from './store';
import { SyncWithDocumentSave } from './sync-with-document';

export function init() {
	registerSlice( slice );
	registerPanel( panel );

	stylesRepository.register( globalClassesStylesProvider );

	injectIntoLogic( {
		id: 'global-classes-populate-store',
		component: PopulateStore,
	} );

	injectIntoLogic( {
		id: 'global-classes-sync-with-document',
		component: SyncWithDocumentSave,
	} );

	injectIntoLogic( {
		id: 'global-classes-prefetch-css-class-usage',
		component: PrefetchCssClassUsage,
	} );

	injectIntoCssClassConvert( {
		id: 'global-classes-convert-from-local-class',
		component: ConvertLocalClassToGlobalClass,
	} );

	injectIntoClassSelectorActions( {
		id: 'global-classes-manager-button',
		component: ClassManagerButton,
	} );

	registerStyleProviderToColors( GLOBAL_CLASSES_PROVIDER_KEY, {
		name: 'global',
		getThemeColor: ( theme ) => theme.palette.global.dark,
	} );

	initMcpIntegration();
}
