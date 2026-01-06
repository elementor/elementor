import { createTransformer } from '@elementor/editor-canvas';

import { type ComponentInstanceOverridePropValue } from './prop-types/component-instance-override-prop-type';

export const componentOverrideTransformer = createTransformer( ( override: ComponentInstanceOverridePropValue ) => {
	const { override_key: key, override_value: overrideValue } = override;

	return { [ key ]: overrideValue };
} );
