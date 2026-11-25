import { dropElement } from '@elementor/editor-elements';

import { buildElementModel } from './build-element-model';
import { type ElementTile } from './group-widgets';

type SelectedContainer = {
	id: string;
	parent?: { id: string; model: { get: ( key: string ) => { findIndex: ( model: unknown ) => number } } };
	model: { get: ( key: string ) => unknown };
	view?: { $el?: Array< Node > };
};

type ExtendedWindow = {
	elementor?: {
		selection?: { getElements: () => SelectedContainer[] };
		getPreviewContainer?: () => { id: string } | undefined;
		documents?: { getCurrent?: () => { $element?: Array< Node > } | undefined };
		userCan?: ( capability: string ) => boolean;
	};
	elementorCommon?: {
		eventsManager?: { dispatchEvent?: ( name: string, data: Record< string, unknown > ) => void };
	};
};

const getElementor = () => ( window as unknown as ExtendedWindow ).elementor;

export function canInsertElements() {
	const elementor = getElementor();

	return !! elementor?.getPreviewContainer?.() && !! elementor.userCan?.( 'design' );
}

export function insertElement( tile: ElementTile ) {
	const target = resolveTarget();

	if ( ! target ) {
		return;
	}

	const model = buildElementModel( tile );

	const result = dropElement( {
		containerId: target.containerId,
		model,
		options: { at: target.at, scrollIntoView: true },
	} );

	if ( result ) {
		trackAddElement( model );
	}
}

function resolveTarget() {
	const elementor = getElementor();
	const selected = getSelectedInDocument();

	if ( selected.length > 1 ) {
		return null;
	}

	const [ element ] = selected;

	if ( ! element ) {
		const previewContainer = elementor?.getPreviewContainer?.();

		return previewContainer ? { containerId: previewContainer.id, at: undefined } : null;
	}

	if ( element.model.get( 'elType' ) === 'widget' && element.parent ) {
		return {
			containerId: element.parent.id,
			at: element.parent.model.get( 'elements' ).findIndex( element.model ) + 1,
		};
	}

	return { containerId: element.id, at: undefined };
}

function getSelectedInDocument() {
	const elementor = getElementor();
	const documentElement = elementor?.documents?.getCurrent?.()?.$element?.[ 0 ];

	return ( elementor?.selection?.getElements() ?? [] ).filter( ( { view } ) => {
		const node = view?.$el?.[ 0 ];

		return ! documentElement || ! node || documentElement.contains( node );
	} );
}

function trackAddElement( model: ReturnType< typeof buildElementModel > ) {
	const { elType, widgetType } = model;

	( window as unknown as ExtendedWindow ).elementorCommon?.eventsManager?.dispatchEvent?.( 'add_element', {
		location: 'editor_panel',
		element_name: elType === 'widget' ? widgetType : elType,
		element_type: elType,
		widget_type: widgetType,
	} );
}
