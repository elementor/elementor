import { endDragElementFromPanel, startDragElementFromPanel } from '@elementor/editor-canvas';

import { setPanelDragging } from '../drag-state';
import { buildElementModel } from './build-element-model';
import { type ElementTile } from './group-widgets';

export function isDragReady() {
	const { elementor } = window;

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

	startDragElementFromPanel( model, event, custom );
	setPanelDragging( true );
	window.elementor?.channels?.panelElements?.on( 'element:drag:end', onChannelDragEnd );
}

export function endTileDrag() {
	endDragElementFromPanel();
	setPanelDragging( false );
}

function onChannelDragEnd() {
	window.elementor?.channels?.panelElements?.off( 'element:drag:end', onChannelDragEnd );
	setPanelDragging( false );
}
