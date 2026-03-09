import { getExtendedUnits } from '../sync/get-units';
import { type SizeUnit } from '../types';

export const isExtendedUnit = ( unit: SizeUnit ) => {
	const extendedUnits = getExtendedUnits();

	return extendedUnits.includes( unit );
};
