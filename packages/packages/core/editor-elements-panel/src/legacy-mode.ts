import { useEffect, useRef } from 'react';

import {
	getElementsPanelSelection,
	subscribeToElementsPanelSelection,
	useElementsPanelSelection,
} from './elements-panel-selection';
import { isAtomicElementsPanelEnabled } from './gate';

export function isLegacyElementsPanelSelected() {
	return isAtomicElementsPanelEnabled() && getElementsPanelSelection() === 'non_atomic';
}

export function useIsLegacyElementsPanelSelected() {
	const selection = useElementsPanelSelection();

	return isAtomicElementsPanelEnabled() && selection === 'non_atomic';
}

export function useOnSwitchToLegacyElementsPanel( callback: () => void ) {
	const callbackRef = useRef( callback );

	callbackRef.current = callback;

	useEffect( () => {
		let previous = getElementsPanelSelection();

		return subscribeToElementsPanelSelection( () => {
			const next = getElementsPanelSelection();

			if ( previous === 'atomic' && next === 'non_atomic' && isAtomicElementsPanelEnabled() ) {
				callbackRef.current();
			}

			previous = next;
		} );
	}, [] );
}
