import * as React from 'react';
import { getElements, useSelectedElement } from '@elementor/editor-elements';
import {
	__privateUseIsRouteActive as useIsRouteActive,
	__privateUseListenTo as useListenTo,
	useEditMode,
	windowEvent,
} from '@elementor/editor-v1-adapters';

import { GridOutlineOverlay } from './grid-outline-overlay';

const GRID_ELEMENT_TYPE = 'e-grid';

type GridElementData = {
	id: string;
	domElement: HTMLElement;
};

function useGridElements(): GridElementData[] {
	return useListenTo(
		[
			windowEvent( 'elementor/editor/element-rendered' ),
			windowEvent( 'elementor/editor/element-destroyed' ),
			windowEvent( 'elementor/preview/atomic-widget/render' ),
			windowEvent( 'elementor/preview/atomic-widget/destroy' ),
		],
		() => {
			return getElements()
				.filter( ( el ) => {
					const elType = el.model?.get( 'elType' );
					const widgetType = el.model?.get( 'widgetType' );
					return elType === GRID_ELEMENT_TYPE || widgetType === GRID_ELEMENT_TYPE;
				} )
				.map( ( element ) => ( {
					id: element.id,
					domElement: element.view?.getDomElement?.()?.get?.( 0 ),
				} ) )
				.filter( ( item ): item is GridElementData => !! item.domElement );
		}
	);
}

export function GridOutlinesLayer() {
	const selected = useSelectedElement();
	const grids = useGridElements();
	const currentEditMode = useEditMode();

	const isEditMode = currentEditMode === 'edit';
	const isKitRouteActive = useIsRouteActive( 'panel/global' );

	if ( ! isEditMode || isKitRouteActive ) {
		return null;
	}

	return (
		<>
			{ grids.map( ( { id, domElement } ) => (
				<GridOutlineOverlay
					key={ id }
					id={ id }
					element={ domElement }
					isSelected={ selected.element?.id === id }
				/>
			) ) }
		</>
	);
}
