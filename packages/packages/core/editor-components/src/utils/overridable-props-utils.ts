import { componentInstanceOverridePropTypeUtil } from '../prop-types/component-instance-override-prop-type';
import {
	type ComponentInstanceOverride,
	type ComponentInstanceOverridesPropValue,
} from '../prop-types/component-instance-overrides-prop-type';
import { componentOverridablePropTypeUtil } from '../prop-types/component-overridable-prop-type';

export type InnerOverrideInfo = {
	componentId: number;
	innerOverrideKey: string;
	overrideValue: unknown;
};

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

export function extractInnerOverrideInfo( override: ComponentInstanceOverride | null ): InnerOverrideInfo | null {
	if ( ! override ) {
		return null;
	}

	const overridableValue = componentOverridablePropTypeUtil.extract( override );
	const innerOverride = overridableValue
		? componentInstanceOverridePropTypeUtil.extract( overridableValue.origin_value )
		: componentInstanceOverridePropTypeUtil.extract( override );

	if ( ! innerOverride ) {
		return null;
	}

	const {
		schema_source: schemaSource,
		override_key: innerOverrideKey,
		override_value: overrideValue,
	} = innerOverride;
	const componentId = schemaSource?.id;

	if ( ! componentId || ! innerOverrideKey ) {
		return null;
	}

	return { componentId, innerOverrideKey, overrideValue };
}
