import { type V1ElementModelProps } from '@elementor/editor-elements';

import { type CanvasExtendedWindow } from './types';

const DRAG_GROUPS = [ 'elementor-element' ];

export const endDragElementFromPanel = () => {
	getElementorChannels()?.panelElements?.trigger( 'element:drag:end' );
};

export const startDragElementFromPanel = ( props: Omit< V1ElementModelProps, 'id' >, event: React.DragEvent ) => {
	setDragGroups( event );

	const channels = getElementorChannels();

	channels?.editor.reply( 'element:dragged', null );

	channels?.panelElements
		.reply( 'element:selected', getLegacyPanelElementView( props ) )
		.trigger( 'element:drag:start' );
};

const setDragGroups = ( event: React.DragEvent ) => {
	const dataContainer = { groups: getDragGroups( event ) };
	event.dataTransfer?.setData( JSON.stringify( dataContainer ), 'true' );
};

const getDragGroups = ( event: React.DragEvent ) => {
	const dataContainer = event.dataTransfer?.getData( 'text/plain' );

	return dataContainer ? JSON.parse( dataContainer ).groups : DRAG_GROUPS;
};

const getElementorChannels = () => {
	const extendedWindow = window as unknown as CanvasExtendedWindow;
	const channels = extendedWindow.elementor?.channels;

	if ( ! channels ) {
		throw new Error(
			'Elementor channels not found: Elementor editor is not initialized or channels are unavailable.'
		);
	}

	return channels;
};

const getLegacyPanelElementView = ( { settings, ...rest }: Omit< V1ElementModelProps, 'id' > ) => {
	const extendedWindow = window as unknown as CanvasExtendedWindow;
	const LegacyElementModel = extendedWindow.elementor?.modules?.elements?.models?.Element;

	if ( ! LegacyElementModel ) {
		throw new Error( 'Elementor legacy Element model not found in editor modules' );
	}

	const elementModel = new LegacyElementModel( {
		...rest,
		custom: {
			isPreset: !! settings,
			preset_settings: settings,
		},
	} );

	return { model: elementModel };
};
