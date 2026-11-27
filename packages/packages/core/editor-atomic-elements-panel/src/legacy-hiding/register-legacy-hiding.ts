import { getWidgetsCache } from '@elementor/editor-elements';
import { __privateListenTo as listenTo, v1ReadyEvent } from '@elementor/editor-v1-adapters';

import { type WidgetsCache } from '../utils/get-atomic-widgets';
import { filterLegacyCollections } from './filter-legacy-collections';
import { getLegacyHiddenTypes } from './get-legacy-hidden-types';
import { isLegacyHidingDisabled } from './legacy-hiding-state';
import { type LegacyCollections, type WindowWithFilterHooks } from './types';

const FILTER_NAME = 'panel/elements/collections';

export function registerLegacyHiding() {
	if ( tryAddFilter() ) {
		return;
	}

	listenTo( v1ReadyEvent(), () => {
		tryAddFilter();
	} );
}

function tryAddFilter(): boolean {
	const hooks = ( window as unknown as WindowWithFilterHooks ).elementor?.hooks;

	if ( ! hooks?.addFilter ) {
		return false;
	}

	hooks.addFilter( FILTER_NAME, hideAtomicPanelElements );

	return true;
}

// Reads the cache on every Legacy rebuild, so it stays fresh after `refreshWidgets()`.
function hideAtomicPanelElements( collections: LegacyCollections ): LegacyCollections {
	if ( isLegacyHidingDisabled() ) {
		return collections;
	}

	return filterLegacyCollections( collections, getLegacyHiddenTypes( getWidgetsCache() as WidgetsCache | null ) );
}
