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

type OverrideRenderContext = { overrides?: Record< string, unknown > };

export function resolveInstanceElementSettings(
	elementSettings: Props,
	renderContext: OverrideRenderContext | undefined
): Props {
	const overrideMap = renderContext?.overrides ?? {};
	const resolvedSettings: Props = {};

	for ( const [ propKey, propValue ] of Object.entries( elementSettings ) ) {
		const overridable = componentOverridablePropTypeUtil.extract( propValue );

		if ( ! overridable ) {
			resolvedSettings[ propKey ] = propValue;
			continue;
		}

		const overrideValue = overrideMap[ overridable.override_key ];

		resolvedSettings[ propKey ] = ( overrideValue ?? overridable.origin_value ) as PropValue;
	}

	return resolvedSettings;
}

export function getRenderContextFromContainer( container: unknown ): OverrideRenderContext | undefined {
	const view = ( container as { view?: { getResolverRenderContext?: () => OverrideRenderContext | undefined } } )
		?.view;

	return view?.getResolverRenderContext?.();
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
