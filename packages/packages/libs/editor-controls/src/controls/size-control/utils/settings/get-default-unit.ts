import type { PropType } from '@elementor/editor-props';

import { getPropTypeSettings } from './get-prop-type-settings';

export const getDefaultUnit = ( propType: PropType ) => {
	return getPropTypeSettings( propType )?.default_unit;
};
