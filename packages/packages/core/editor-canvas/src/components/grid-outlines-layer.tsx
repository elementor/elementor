import * as React from 'react';
import { getElements } from '@elementor/editor-elements';
import {
	__privateUseIsRouteActive as useIsRouteActive,
	__privateUseListenTo as useListenTo,
	useEditMode,
	windowEvent,
} from '@elementor/editor-v1-adapters';

import { GridOutlineOverlay } from './grid-outline-overlay';

const GRID_ELEMENT_TYPE = 'e-grid';

export function GridOutlinesLayer() {
	const grids = useGridElements();
	const currentEditMode = useEditMode();

	const isEditMode = currentEditMode === 'edit';
	const isKitRouteActive = useIsRouteActive( 'panel/global' );
	const isActive = isEditMode && ! isKitRouteActive;

	if ( ! isActive ) {
		return null;
	}

	return grids.map( ( { id, domElement } ) => (
		<GridOutlineOverlay key={ id } id={ id } element={ domElement } isSelected={ false } />
	) );
}

type GridData = {
	id: string;
	domElement: HTMLElement;
};

function useGridElements(): GridData[] {
	return useListenTo(
		[ windowEvent( 'elementor/editor/element-rendered' ), windowEvent( 'elementor/editor/element-destroyed' ) ],
		() => {
			return getElements()
				.filter( ( el ) => el.model?.get?.( 'elType' ) === GRID_ELEMENT_TYPE )
				.map( ( element ) => ( {
					id: element.id,
					domElement: element.view?.getDomElement?.()?.get?.( 0 ),
				} ) )
				.filter( ( item ): item is GridData => !! item.domElement );
		}
	);
}
