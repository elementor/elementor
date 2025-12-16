import { createTransformer } from '@elementor/editor-canvas';

import { type ComponentOverridable } from './types';

export const componentOverridableTransformer = createTransformer( ( value: ComponentOverridable ) => {
	// todo: render component overrides
	return value.origin_value;
} );
