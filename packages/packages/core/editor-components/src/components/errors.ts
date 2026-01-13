import { createError } from '@elementor/utils';

export const OverrideControlInnerElementNotFoundError = createError< { componentId: number; elementId: string } >( {
	code: 'override_control_inner_element_not_found',
	message: `Component inner element not found for override control. The element may have been deleted without updating the overridable props, or the component has not finished rendering yet.`,
} );
