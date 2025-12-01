import { __getState as getState } from '@elementor/store';

import { selectOverridableProps } from '../../../store/store';
import { type OverridableProp } from '../../../types';

export function getOverridableProp( {
	componentId,
	elementId,
	widgetType,
	elType,
	propKey,
}: {
	componentId: number;
	elementId: string;
	widgetType: string;
	elType: string;
	propKey: string;
} ): OverridableProp | undefined {
	const overridables = selectOverridableProps( getState(), componentId );

	if ( ! overridables ) {
		return undefined;
	}

	return Object.values( overridables.props ).find(
		( prop ) =>
			prop.elementId === elementId &&
			prop.propKey === propKey &&
			prop.widgetType === widgetType &&
			prop.elType === elType
	);
}
