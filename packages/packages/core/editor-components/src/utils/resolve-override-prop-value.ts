import { type Props, type PropValue } from '@elementor/editor-props';

import {
	type ComponentInstanceOverrideProp,
	componentInstanceOverridePropTypeUtil,
} from '../prop-types/component-instance-override-prop-type';
import { type ComponentInstanceOverride } from '../prop-types/component-instance-overrides-prop-type';
import {
	type ComponentOverridableProp,
	componentOverridablePropTypeUtil,
} from '../prop-types/component-overridable-prop-type';

export type SettingsOverride = {
	innermostKey: string;
	outermostKey?: string;
	value: unknown;
};

export function applyOverridesToSettings( elementSettings: Props, overrides: SettingsOverride[] ): Props {
	const overridesMap = new Map( overrides.map( ( o ) => [ o.innermostKey, o ] ) );
	const result: Props = {};

	for ( const [ propKey, propValue ] of Object.entries( elementSettings ) ) {
		const overridable = componentOverridablePropTypeUtil.extract( propValue );

		if ( ! overridable ) {
			result[ propKey ] = propValue;
			continue;
		}

		const override = overridesMap.get( overridable.override_key );

		if ( ! override ) {
			result[ propKey ] = propValue;
			continue;
		}

		if ( override.outermostKey ) {
			result[ propKey ] = {
				$$type: 'overridable',
				value: {
					override_key: override.outermostKey,
					origin_value: override.value,
				},
			} as PropValue;
		} else {
			result[ propKey ] = override.value as PropValue;
		}
	}

	return result;
}

export function unwrapOverridableSettings( elementSettings: Props ): Props {
	const result: Props = {};

	for ( const [ propKey, propValue ] of Object.entries( elementSettings ) ) {
		const overridable = componentOverridablePropTypeUtil.extract( propValue );

		if ( ! overridable ) {
			result[ propKey ] = propValue;
			continue;
		}

		result[ propKey ] = overridable.origin_value as PropValue;
	}

	return result;
}

export const resolveOverridePropValue = ( originalPropValue: ComponentInstanceOverride | PropValue ): PropValue => {
	const isOverridable = componentOverridablePropTypeUtil.isValid( originalPropValue );
	if ( isOverridable ) {
		return getOverridableValue( originalPropValue as ComponentOverridableProp );
	}

	const isOverride = componentInstanceOverridePropTypeUtil.isValid( originalPropValue );
	if ( isOverride ) {
		return getOverrideValue( originalPropValue );
	}

	return originalPropValue;
};

function getOverridableValue( overridableProp: ComponentOverridableProp | null ): PropValue {
	const overridableValue = componentOverridablePropTypeUtil.extract( overridableProp );

	if ( ! overridableValue ) {
		return null;
	}

	const isOverride = componentInstanceOverridePropTypeUtil.isValid( overridableValue.origin_value );

	if ( isOverride ) {
		return getOverrideValue( overridableValue.origin_value as ComponentInstanceOverrideProp );
	}

	return overridableValue.origin_value;
}

function getOverrideValue( overrideProp: ComponentInstanceOverrideProp | null ): PropValue {
	const overrideValue = componentInstanceOverridePropTypeUtil.extract( overrideProp );

	if ( ! overrideValue ) {
		return null;
	}

	return overrideValue.override_value as PropValue;
}
