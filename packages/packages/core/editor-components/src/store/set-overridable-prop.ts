import { type PropValue } from '@elementor/editor-props';
import { __dispatch as dispatch } from '@elementor/store';
import { generateUniqueId } from '@elementor/utils';

import { slice } from './store';

export function setOverridableProp(
	componentId: number,
	elementId: string,
	label: string,
	groupId: string | null,
	propKey: string,
	widgetType: string,
	defaultValue: PropValue
) {
	dispatch(
		slice.actions.addOverridableProp( {
			componentId,
			'override-key': generateUniqueId(),
			label,
			elementId,
			propKey,
			widgetType,
			defaultValue,
			groupId,
		} )
	);
}
