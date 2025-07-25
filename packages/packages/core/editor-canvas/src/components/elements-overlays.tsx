import * as React from 'react';
import { getElements, useSelectedElement } from '@elementor/editor-elements';
import {
	__privateUseIsRouteActive as useIsRouteActive,
	__privateUseListenTo as useListenTo,
	useEditMode,
	windowEvent,
} from '@elementor/editor-v1-adapters';

import { ElementOverlay } from './element-overlay';

export function ElementsOverlays() {
	const selected = useSelectedElement();
	const elements = useElementsDom();
	const currentEditMode = useEditMode();

	const isEditMode = currentEditMode === 'edit';
	const isKitRouteActive = useIsRouteActive( 'panel/global' );

	const isActive = isEditMode && ! isKitRouteActive;

	return (
		isActive &&
		elements.map( ( [ id, element ] ) => (
			<ElementOverlay key={ id } id={ id } element={ element } isSelected={ selected.element?.id === id } />
		) )
	);
}

const ELEMENTS_DATA_ATTR = 'atomic';

type IdElementTuple = [ string, HTMLElement ];

function useElementsDom() {
	return useListenTo(
		[ windowEvent( 'elementor/editor/element-rendered' ), windowEvent( 'elementor/editor/element-destroyed' ) ],
		() => {
			return getElements()
				.filter( ( el ) => ELEMENTS_DATA_ATTR in ( el.view?.el?.dataset ?? {} ) )
				.map( ( element ) => [ element.id, element.view?.getDomElement?.()?.get?.( 0 ) ] )
				.filter( ( item ): item is IdElementTuple => !! item[ 1 ] );
		}
	);
}
