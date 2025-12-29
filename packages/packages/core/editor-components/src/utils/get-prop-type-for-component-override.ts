import { getWidgetsCache } from '@elementor/editor-elements';

import { type OriginPropFields, type OverridableProp } from '../types';

export const getPropTypeForComponentOverride = ( overridableProp: OverridableProp ) => {
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

function getPropType( { widgetType, propKey }: OriginPropFields ) {
	const widgetPropsSchema = getWidgetsCache()?.[ widgetType ]?.atomic_props_schema;

	return widgetPropsSchema?.[ propKey ];
}
