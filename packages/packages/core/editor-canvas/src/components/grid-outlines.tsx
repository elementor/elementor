import * as React from 'react';
import { getElements } from '@elementor/editor-elements';
import {
	__privateUseIsRouteActive as useIsRouteActive,
	__privateUseListenTo as useListenTo,
	useEditMode,
	windowEvent,
} from '@elementor/editor-v1-adapters';

import { GridOutlineOverlay } from './grid-outline-overlay';

type GridElementData = {
	id: string;
	domElement: HTMLElement;
};

export function GridOutlines() {
	const grids = useGrids();
	const currentEditMode = useEditMode();
	const isKitRouteActive = useIsRouteActive( 'panel/global' );

	if ( currentEditMode !== 'edit' || isKitRouteActive ) {
		return null;
	}

	return (
		<>
			{ grids.map( ( { id, domElement } ) => (
				<GridOutlineOverlay key={ id } id={ id } element={ domElement } isSelected={ false } />
			) ) }
		</>
	);
}

function useGrids(): GridElementData[] {
	return useListenTo(
		[ windowEvent( 'elementor/editor/element-rendered' ), windowEvent( 'elementor/editor/element-destroyed' ) ],
		() => {
			return getElements()
				.filter( ( el ) => el.model?.get?.( 'elType' ) === 'e-grid' )
				.map( ( element ) => ( {
					id: element.id,
					domElement: element.view?.getDomElement?.()?.get?.( 0 ),
				} ) )
				.filter( ( item ): item is GridElementData => !! item.domElement );
		}
	);
}
