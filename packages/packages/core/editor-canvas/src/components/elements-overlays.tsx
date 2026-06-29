import * as React from 'react';
import { getElements, useSelectedElement } from '@elementor/editor-elements';
import {
	__privateUseIsRouteActive as useIsRouteActive,
	__privateUseListenTo as useListenTo,
	useEditMode,
	windowEvent,
} from '@elementor/editor-v1-adapters';

import type { ElementOverlayConfig } from '../types/element-overlay';
import { GridEmptyCellPositioner, GridOutlineOverlay } from './grid-outline';
import { OutlineOverlay } from './outline-overlay';

const ELEMENTS_DATA_ATTR = 'atomic';

const overlayRegistry: ElementOverlayConfig[] = [
	{
		component: OutlineOverlay,
		shouldRender: () => true,
	},
	{
		component: GridEmptyCellPositioner,
		shouldRender: () => true,
	},
	{
		component: GridOutlineOverlay,
		shouldRender: ( { isSelected } ) => isSelected,
	},
];

export function ElementsOverlays() {
	const selected = useSelectedElement();
	const elements = useElementsDom();
	const currentEditMode = useEditMode();

	const isEditMode = currentEditMode === 'edit';
	const isKitRouteActive = useIsRouteActive( 'panel/global' );
	const isActive = isEditMode && ! isKitRouteActive;

	if ( ! isActive ) {
		return null;
	}

	return elements.map( ( { id, domElement, isGlobal } ) => {
		const isSelected = selected.element?.id === id;

		return overlayRegistry.map(
			( { shouldRender, component: Overlay }, index ) =>
				shouldRender( { id, element: domElement, isSelected } ) && (
					<Overlay
						key={ `${ id }-${ index }` }
						id={ id }
						element={ domElement }
						isSelected={ isSelected }
						isGlobal={ isGlobal }
					/>
				)
		);
	} );
}

type ElementData = {
	id: string;
	domElement: HTMLElement;
	isGlobal: boolean;
};

function useElementsDom() {
	return useListenTo(
		[ windowEvent( 'elementor/editor/element-rendered' ), windowEvent( 'elementor/editor/element-destroyed' ) ],
		() => {
			return getElements()
				.filter( ( el ) => isV4Element( el.view?.el?.dataset ) )
				.map( ( element ) => ( {
					id: element.id,
					domElement: element.view?.getDomElement?.()?.get?.( 0 ),
					isGlobal: element.model.get( 'isGlobal' ) ?? false,
				} ) )
				.filter( ( item ): item is ElementData => !! item.domElement );
		}
	);
}

function isV4Element( dataset: DOMStringMap | undefined ): boolean {
	if ( ! dataset ) {
		return false;
	}

	return ELEMENTS_DATA_ATTR in dataset || 'eType' in dataset;
}
