import { getWidgetsCache } from '@elementor/editor-elements';
import { type PropType } from '@elementor/editor-props';

import { type OriginPropFields, type OverridableProp } from '../types';

export const getPropTypeForComponentOverride = ( overridableProp: OverridableProp ): PropType | undefined => {
	if ( overridableProp.originPropFields ) {
		return getPropType( overridableProp.originPropFields );
	}

	const { elType, widgetType, propKey } = overridableProp;

	return getPropType( {
		elType,
		widgetType,
		propKey,
	} );
};

function getPropType( { widgetType, propKey }: OriginPropFields ): PropType | undefined {
	const widgetPropsSchema = getWidgetsCache()?.[ widgetType ]?.atomic_props_schema;

	return widgetPropsSchema?.[ propKey ] as PropType;
}
