import { endDragElementFromPanel, startDragElementFromPanel } from '@elementor/editor-canvas';

import { type CompositeWidgetDefinition } from '../types';
import { buildCompositeDropModel } from './build-composite-drop-model';

export function startDragCompositeWidget( definition: CompositeWidgetDefinition, event: React.DragEvent ) {
	startDragElementFromPanel( buildCompositeDropModel( definition ), event );
}

export function endDragCompositeWidget() {
	endDragElementFromPanel();
}
