import { createMockElement } from 'test-utils';
import { type V1Element, type V1ElementSettingsProps } from '@elementor/editor-elements';

export function createMockElementWithOverridableProps(
	elementId: string,
	settings: Partial< V1ElementSettingsProps >
): V1Element {
	return createMockElement( {
		model: {
			id: elementId,
			widgetType: 'e-heading',
			elType: 'widget',
		},
		settings,
	} );
}

