import { __privateUseListenTo as useListenTo, commandEndEvent } from '@elementor/editor-v1-adapters';

import { getElementSetting } from '../sync/get-element-setting';
import { type ElementID } from '../types';

export const useElementSetting = < TValue >( elementId: ElementID, settingKey: string ) => {
	return useListenTo(
		commandEndEvent( 'document/elements/set-settings' ),
		() => getElementSetting< TValue >( elementId, settingKey ),
		[ elementId, settingKey ]
	);
};

export const useElementSettings = < TValue >( elementId: ElementID, settingKeys: string[] ) => {
	return useListenTo(
		commandEndEvent( 'document/elements/set-settings' ),
		() =>
			settingKeys.reduce< Record< string, TValue > >( ( settings, key ) => {
				const value = getElementSetting< TValue >( elementId, key );

				if ( value !== null ) {
					settings[ key ] = value;
				}

				return settings;
			}, {} ),
		[ elementId, ...settingKeys ]
	);
};
