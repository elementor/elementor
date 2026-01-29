import { type ElementID } from '../types';
import { getContainer } from './get-container';
import { findModel } from './get-model';

export const getElementSetting = < TValue >( elementId: ElementID, settingKey: string ): TValue | null => {
	const container = getContainer( elementId );

	if ( container ) {
		return ( container.settings?.get( settingKey ) as TValue ) ?? null;
	}

	const result = findModel( elementId );

	if ( ! result ) {
		return null;
	}

	const settings = result.model.get( 'settings' ) ?? {};

	return ( settings[ settingKey ] as TValue ) ?? null;
};

export const getElementSettings = < TValue >(
	elementId: ElementID,
	settingKey: string[]
): Record< string, TValue | null > => {
	return Object.fromEntries( settingKey.map( ( key ) => [ key, getElementSetting( elementId, key ) ] ) );
};
