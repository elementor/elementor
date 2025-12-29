import { type V1ElementModelProps } from '@elementor/editor-elements';

import { COMPONENT_WIDGET_TYPE } from '../create-component-type';

export function isComponentInstance( elementModel: Partial< V1ElementModelProps > ) {
	return [ elementModel.widgetType, elementModel.elType ].includes( COMPONENT_WIDGET_TYPE );
}
