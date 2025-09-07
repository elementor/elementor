import { type V1ElementModelProps } from '@elementor/editor-elements';

import { type CanvasExtendedWindow } from './types';

export const startDragElementFromPanel = ( props: Omit< V1ElementModelProps, 'id' > ) => {
	const channels = getElementorChannels();

	channels?.editor.reply( 'element:dragged', null );

	channels?.panelElements
		.reply( 'element:selected', getLegacyPanelElementView( props ) )
		.trigger( 'element:drag:start' );
};

export const endDragElement = () => {
	getElementorChannels()?.panelElements?.trigger( 'element:drag:end' );
};

const getElementorChannels = () => {
	const channels = ( window as unknown as CanvasExtendedWindow ).elementor?.channels;

	if ( ! channels ) {
		throw new Error( 'Elementor channels not found' );
	}

	return channels;
};

const getLegacyPanelElementView = ( { settings, ...rest }: Omit< V1ElementModelProps, 'id' > ) => {
	const extendedWindow = window as unknown as CanvasExtendedWindow;
	const LegacyElementModel = extendedWindow.elementor?.modules?.elements?.models?.Element;
		?.Element;

	if ( ! LegacyElementModel ) {
		throw new Error( 'Element model not found' );
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
