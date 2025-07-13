import { type ElementID } from '../types';
import { getContainer } from './get-container';

export const getElementSetting = < TValue >( elementId: ElementID, settingKey: string ): TValue | null => {
	const container = getContainer( elementId );

	return ( container?.settings?.get( settingKey ) as TValue ) ?? null;
};

export const getElementSettings = < TValue >(
	elementId: ElementID,
	settingKey: string[]
): Record< string, TValue | null > => {
	return Object.fromEntries( settingKey.map( ( key ) => [ key, getElementSetting( elementId, key ) ] ) );
};
