import { type V1ElementSettingsProps } from '@elementor/editor-elements';

import { type ElementTile } from './group-widgets';

export function buildElementModel( tile: ElementTile ) {
	return {
		elType: tile.elType,
		widgetType: tile.widgetType,
		...( tile.settings && { settings: tile.settings as V1ElementSettingsProps } ),
	};
}
