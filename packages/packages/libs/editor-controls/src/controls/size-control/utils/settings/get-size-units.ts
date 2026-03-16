import { type PropType } from '@elementor/editor-props';

import { getAngleUnits, getLengthUnits, getTimeUnits } from '../../sync/get-units';
import { type SizeUnit, type SizeVariant } from '../../types';
import { getPropTypeSettings } from './get-prop-type-settings';

const getVariantUnits = ( variant: SizeVariant ): SizeUnit[] => {
	const map: Record< SizeVariant, () => SizeUnit[] > = {
		length: getLengthUnits,
		angle: getAngleUnits,
		time: getTimeUnits,
	};

	return map[ variant ]();
};

const getSettingsUnits = ( propType?: PropType ) => {
	return getPropTypeSettings( propType )?.units;
};

export const getSizeUnits = ( variant: SizeVariant, propType?: PropType ): SizeUnit[] => {
	return getSettingsUnits( propType ) ?? getVariantUnits( variant );
};
