import { createError } from '@elementor/utils';

import { type OverridableProp } from '../types';

export const OverrideControlInnerElementNotFoundError = createError< { componentId: number; elementId: string } >( {
	code: 'override_control_inner_element_not_found',
	message: `Component inner element not found for override control. The element may have been deleted without updating the overridable props, or the component has not finished rendering yet.`,
} );

export const OverrideControlPropTypeNotFoundError = createError< { overridableProp: OverridableProp } >( {
	code: 'override_control_prop_type_not_found',
	message: 'Prop type not found for override control.',
} );
