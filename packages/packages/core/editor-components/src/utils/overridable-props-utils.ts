import { componentInstanceOverridePropTypeUtil } from '../prop-types/component-instance-override-prop-type';
import {
	type ComponentInstanceOverride,
	type ComponentInstanceOverridesPropValue,
} from '../prop-types/component-instance-overrides-prop-type';
import { componentOverridablePropTypeUtil } from '../prop-types/component-overridable-prop-type';

export function getMatchingOverride(
	overrides: ComponentInstanceOverridesPropValue,
	overrideKey: string
): ComponentInstanceOverride | null {
	return (
		overrides?.find( ( override ) => {
			const overridableValue = componentOverridablePropTypeUtil.extract( override );

			if ( overridableValue ) {
				const overrideValue = componentInstanceOverridePropTypeUtil.extract( overridableValue.origin_value );
				return overrideValue?.override_key === overrideKey;
			}

			return override.value.override_key === overrideKey;
		} ) ?? null
	);
}
