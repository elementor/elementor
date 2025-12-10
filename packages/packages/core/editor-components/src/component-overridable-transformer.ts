import { createTransformer, settingsTransformersRegistry } from '@elementor/editor-canvas';

import { type ComponentOverridable } from './types';

export const componentOverridableTransformer = createTransformer(( value: ComponentOverridable, options: { key: string; signal?: AbortSignal } ) => {
		// todo: render component overrides
		return value.origin_value
	}
);
