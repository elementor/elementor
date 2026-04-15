import { type SizePropValue } from '@elementor/editor-props';

import { getExtendedUnits } from '../sync/get-units';
import { type ExtendedSizeOption } from '../types';

export const isExtendedUnit = ( unit: SizePropValue[ 'value' ][ 'unit' ] ): unit is ExtendedSizeOption => {
	return getExtendedUnits().includes( unit as ExtendedSizeOption );
};
