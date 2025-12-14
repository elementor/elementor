import { createTransformer } from '@elementor/editor-canvas';

import { type ComponentOverridePropValue } from './types';

export const componentOverrideTransformer = createTransformer( async ( override: ComponentOverridePropValue ) => {
	const { override_key: key, override_value: overrideValue } = override;

	return { [ key ]: overrideValue };
} );
