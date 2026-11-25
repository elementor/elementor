import { endDragElementFromPanel, startDragElementFromPanel } from '@elementor/editor-canvas';

import { type ExtendedWindow } from '../types';
import { buildElementModel } from './build-element-model';
import { setPanelDragging } from './drag-state';
import { type ElementTile } from './group-widgets';

export function isDragReady() {
	const elementor = ( window as unknown as ExtendedWindow ).elementor;

	return (
		!! elementor?.channels?.editor &&
		!! elementor.channels.panelElements &&
		!! elementor.modules?.elements?.models?.Element &&
		!! elementor.userCan?.( 'design' )
	);
}

export function isDraggableTile( tile: ElementTile ) {
	return ! tile.promotionType && tile.editable !== false && tile.showInPanel !== false && isDragReady();
}

export function startTileDrag( tile: ElementTile, event: React.DragEvent ) {
	const { custom, ...model } = buildElementModel( tile );

	setPanelDragging( true );
	startDragElementFromPanel( model, event, custom );
	document.addEventListener( 'dragend', resetPanelDragging, { once: true, capture: true } );
	document.addEventListener( 'drop', resetPanelDragging, { once: true, capture: true } );
}

export function endTileDrag() {
	resetPanelDragging();
	endDragElementFromPanel();
}

function resetPanelDragging() {
	setPanelDragging( false );
}
