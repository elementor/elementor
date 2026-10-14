import { type ComponentInstanceOverrideProp } from '../../../prop-types/component-instance-override-prop-type';
import { type ComponentInstanceOverride } from '../../../prop-types/component-instance-overrides-prop-type';
import {
	type ComponentOverridableProp,
	componentOverridablePropTypeUtil,
} from '../../../prop-types/component-overridable-prop-type';

type OverrideValue = ComponentInstanceOverrideProp | ComponentOverridableProp;

// The control receives the resolved value, so when exposing a prop that was never overridden,
// origin_value will be the resolved value instead of null.
// So here, we correct this by resetting origin_value to null.
export function correctExposedEmptyOverride(
	newPropValue: OverrideValue,
	matchingOverride: ComponentInstanceOverride | null
): OverrideValue {
	const newOverridableValue = componentOverridablePropTypeUtil.extract( newPropValue );
	const isExposingEmptyOverride = newOverridableValue && matchingOverride === null;

	if ( ! isExposingEmptyOverride ) {
		return newPropValue;
	}

	return componentOverridablePropTypeUtil.create( {
		override_key: newOverridableValue.override_key,
		origin_value: null,
	} );
}
