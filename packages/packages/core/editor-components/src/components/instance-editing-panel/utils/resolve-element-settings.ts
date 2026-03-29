import { type AnyTransformable } from '@elementor/editor-props';

import { componentOverridablePropTypeUtil } from '../../../prop-types/component-overridable-prop-type';

type ElementSettings = Record< string, AnyTransformable | null >;

export type OverridesMapping = {
	[ key: string ]: {
		value: AnyTransformable | null;
		outermostKey?: string;
	};
};

export function applyOverridesToSettings(
	elementSettings: ElementSettings,
	overrides: OverridesMapping
): ElementSettings {
	const result: ElementSettings = {};

	for ( const [ propKey, propValue ] of Object.entries( elementSettings ) ) {
		const overridable = componentOverridablePropTypeUtil.extract( propValue );

		if ( ! overridable ) {
			result[ propKey ] = propValue;
			continue;
		}

		const override = overrides[ overridable.override_key ];

		if ( ! override ) {
			result[ propKey ] = propValue;
			continue;
		}

		if ( override.outermostKey && override.outermostKey !== overridable.override_key ) {
			const originValue = overridable.origin_value as AnyTransformable | null;

			result[ propKey ] = componentOverridablePropTypeUtil.create( {
				override_key: override.outermostKey,
				origin_value: override.value ?? originValue,
			} );
		} else {
			result[ propKey ] = override.value ?? propValue;
		}
	}

	return result;
}

export function unwrapOverridableSettings( elementSettings: ElementSettings ): ElementSettings {
	const result: ElementSettings = {};

	for ( const [ propKey, propValue ] of Object.entries( elementSettings ) ) {
		const overridable = componentOverridablePropTypeUtil.extract( propValue );

		if ( ! overridable ) {
			result[ propKey ] = propValue;
			continue;
		}

		result[ propKey ] = overridable.origin_value as AnyTransformable | null;
	}

	return result;
}
