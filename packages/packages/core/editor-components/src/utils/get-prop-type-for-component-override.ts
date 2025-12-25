import { getWidgetsCache } from '@elementor/editor-elements';
import { type PropType } from '@elementor/editor-props';

import { type OverridableProp } from '../types';

export const getPropTypeForComponentOverride = ( overridableProp: OverridableProp ): PropType | undefined => {
	const originalOverridableProp = overridableProp.overridableProp ?? overridableProp;

	const widgetPropsSchema = getWidgetsCache()?.[ originalOverridableProp.widgetType ]?.atomic_props_schema;

	const propType = widgetPropsSchema?.[ originalOverridableProp.propKey ] as PropType;

	if ( propType ) {
		return propType;
	}

	return overridableProp.propType;
};
