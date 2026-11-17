import { type ElementID } from '../types';
import { getContainer } from './get-container';
import { type V1Element } from './types';

export const getElementSetting = < TValue >( elementId: ElementID, settingKey: string ): TValue | null => {
	return readSetting< TValue >( getContainer( elementId ), settingKey );
};

export const getElementSettings = < TValue >(
	elementId: ElementID,
	settingKey: string[]
): Record< string, TValue | null > => {
	const container = getContainer( elementId );

	return Object.fromEntries( settingKey.map( ( key ) => [ key, readSetting< TValue >( container, key ) ] ) );
};

function readSetting< TValue >( container: V1Element | null, settingKey: string ): TValue | null {
	return ( container?.settings?.get( settingKey ) as TValue ) ?? null;
}
