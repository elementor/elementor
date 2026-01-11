import { __privateUseListenTo as useListenTo, commandEndEvent } from '@elementor/editor-v1-adapters';

import { getElementSetting } from '../sync/get-element-setting';
import { type ExtendedWindow } from '../sync/types';
import { type ElementID } from '../types';

const extendedWindow = window as ExtendedWindow;
export const SINGLE_SETTING_FILTER_NAME = 'v4/element/setting';

export const useElementSetting = < TValue >( elementId: ElementID, settingKey: string ) => {
	return useListenTo(
		commandEndEvent( 'document/elements/set-settings' ),
		() => {
			const setting = getElementSetting< TValue >( elementId, settingKey );

			return extendedWindow.elementor?.hooks?.applyFilters?.( SINGLE_SETTING_FILTER_NAME, setting ) ?? setting;
		},
		[ elementId, settingKey ]
	);
};

export const useElementSettings = < TValue >( elementId: ElementID, settingKeys: string[] ) => {
	return useListenTo(
		commandEndEvent( 'document/elements/set-settings' ),
		() =>
			settingKeys.reduce< Record< string, TValue > >( ( settings, key ) => {
				const setting = getElementSetting< TValue >( elementId, key );
				const value =
					extendedWindow.elementor?.hooks?.applyFilters?.( SINGLE_SETTING_FILTER_NAME, setting ) ?? setting;

				if ( value !== null ) {
					settings[ key ] = value;
				}

				return settings;
			}, {} ),
		[ elementId, settingKeys.join( ',' ) ]
	);
};
