import { type ElementID } from '../types';
import { getContainer } from './get-container';
import { type SettingsVariant } from './types';

export const getElementSettingsVariants = ( elementID: ElementID ): SettingsVariant[] => {
	const container = getContainer( elementID );

	return structuredClone( container?.model.get( 'settings_variants' ) ?? [] );
};

export const getSettingsVariantByMeta = (
	variants: SettingsVariant[],
	breakpoint: string
): SettingsVariant | undefined => {
	return variants.find( ( variant ) => variant.meta.breakpoint === breakpoint );
};
