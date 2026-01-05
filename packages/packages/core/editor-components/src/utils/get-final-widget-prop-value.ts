import { type PropValue, type TransformablePropValue } from '@elementor/editor-props';

import { componentInstanceOverridePropTypeUtil } from '../prop-types/component-instance-override-prop-type';
import { type ComponentInstanceOverride } from '../prop-types/component-instance-overrides-prop-type';
import { componentOverridablePropTypeUtil } from '../prop-types/component-overridable-prop-type';

export const getFinalWidgetPropValue = ( override: ComponentInstanceOverride | PropValue ): PropValue => {
	const overridableValue = componentOverridablePropTypeUtil.extract( override );
	const overrideValue = componentInstanceOverridePropTypeUtil.extract( override );

	if ( overridableValue ) {
		const overridableOverrideValue = componentInstanceOverridePropTypeUtil.extract( overridableValue.origin_value );

		if ( overridableOverrideValue ) {
			return overridableOverrideValue.override_value as TransformablePropValue< string, unknown >;
		}

		return overridableValue.origin_value as TransformablePropValue< string, unknown >;
	}

	if ( overrideValue ) {
		return overrideValue.override_value as TransformablePropValue< string, unknown >;
	}

	return override;
};
