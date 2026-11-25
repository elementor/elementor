import { type V1ElementSettingsProps } from '@elementor/editor-elements';

import { type ElementTile } from './group-widgets';

export function buildElementModel( tile: ElementTile ) {
	const { promotionType, settings, ...model } = tile;

	return {
		...model,
		...( settings && { settings: settings as V1ElementSettingsProps } ),
	};
}
