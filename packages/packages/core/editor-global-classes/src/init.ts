import { injectIntoLogic } from '@elementor/editor';
import { injectIntoClassSelectorActions, registerStyleProviderToColors } from '@elementor/editor-editing-panel';
import { __registerPanel as registerPanel } from '@elementor/editor-panels';
import { stylesRepository } from '@elementor/editor-styles-repository';
import { __privateListenTo as listenTo, v1ReadyEvent } from '@elementor/editor-v1-adapters';
import { __registerSlice as registerSlice } from '@elementor/store';

import { ClassManagerButton } from './components/class-manager/class-manager-button';
import { panel } from './components/class-manager/class-manager-panel';
import { PopulateStore } from './components/populate-store';
import { GLOBAL_CLASSES_PROVIDER_KEY, globalClassesStylesProvider } from './global-classes-styles-provider';
import { slice } from './store';
import { syncWithDocumentSave } from './sync-with-document-save';

export function init() {
	registerSlice( slice );
	registerPanel( panel );

	stylesRepository.register( globalClassesStylesProvider );

	injectIntoLogic( {
		id: 'global-classes-populate-store',
		component: PopulateStore,
	} );

	injectIntoClassSelectorActions( {
		id: 'global-classes-manager-button',
		component: ClassManagerButton,
	} );

	registerStyleProviderToColors( GLOBAL_CLASSES_PROVIDER_KEY, {
		name: 'global',
		getThemeColor: ( theme ) => theme.palette.global.dark,
	} );

	listenTo( v1ReadyEvent(), () => {
		syncWithDocumentSave();
	} );
}
