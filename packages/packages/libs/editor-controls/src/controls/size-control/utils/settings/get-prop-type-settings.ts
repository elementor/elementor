import { type PropType } from '@elementor/editor-props';

import { type SizeUnit } from '../../types';

type Settings = {
	units?: SizeUnit[];
	default_unit?: SizeUnit;
};

export const getPropTypeSettings = ( propType?: PropType ) => {
	return propType?.settings as Settings;
};
