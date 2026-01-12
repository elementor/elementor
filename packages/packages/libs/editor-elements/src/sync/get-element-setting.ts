import { type ElementID } from '../types';
import { getContainer } from './get-container';
import { type ExtendedWindow } from './types';

const extendedWindow = window as ExtendedWindow;
export const TOP_LEVEL_SINGLE_SETTING_FILTER = 'v4/element/setting';

export const getElementSetting = < TValue >( elementId: ElementID, settingKey: string ): TValue | null => {
	const container = getContainer( elementId );
	const value = ( container?.settings?.get( settingKey ) as TValue ) ?? null;

	return extendedWindow.elementor?.hooks?.applyFilters
		? extendedWindow.elementor.hooks?.applyFilters( TOP_LEVEL_SINGLE_SETTING_FILTER, value )
		: value;
};

export const getElementSettings = < TValue >(
	elementId: ElementID,
	settingKey: string[]
): Record< string, TValue | null > => {
	return Object.fromEntries( settingKey.map( ( key ) => [ key, getElementSetting( elementId, key ) ] ) );
};
