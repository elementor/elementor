import { injectIntoLogic } from '@elementor/editor';
import {
	injectIntoClassSelectorActions,
	injectIntoCssClassConvert,
	registerStyleProviderToColors,
} from '@elementor/editor-editing-panel';
import { getMCPByDomain } from '@elementor/editor-mcp';
import { stylesRepository } from '@elementor/editor-styles-repository';
import { __registerSlice as registerSlice } from '@elementor/store';

import { ClassSelectorOpenDesignSystemButton } from './components/class-selector/class-selector-open-design-system-button';
import { ConvertLocalClassToGlobalClass } from './components/convert-local-class-to-global-class';
import { GlobalStylesImportListener } from './components/global-styles-import-listener';
import { PopulateStore } from './components/populate-store';
import { GLOBAL_CLASSES_PROVIDER_KEY, globalClassesStylesProvider } from './global-classes-styles-provider';
import { PrefetchCssClassUsage } from './hooks/use-prefetch-css-class-usage';
import { initMcpIntegration } from './mcp-integration';
import { slice } from './store';

export function init() {
	registerSlice( slice );
	stylesRepository.register( globalClassesStylesProvider );

	injectIntoLogic( {
		id: 'global-classes-populate-store',
		component: PopulateStore,
	} );

	injectIntoLogic( {
		id: 'global-classes-import-listener',
		component: GlobalStylesImportListener,
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
		id: 'class-selector-open-design-system',
		component: ClassSelectorOpenDesignSystemButton,
	} );

	registerStyleProviderToColors( GLOBAL_CLASSES_PROVIDER_KEY, {
		name: 'global',
		getThemeColor: ( theme ) => theme.palette.global.dark,
	} );

	initMcpIntegration(
		getMCPByDomain( 'classes', { instructions: 'MCP server for management of Elementor global classes' } ),
		getMCPByDomain( 'canvas' )
	);
}
