import { type ElementID } from '../types';
import { getContainer } from './get-container';

export const getElementSetting = < TValue >( elementId: ElementID, settingKey: string ): TValue | null => {
	const container = getContainer( elementId );
	const value = container?.settings?.get( settingKey ) as TValue;

	return value ?? null;
};
