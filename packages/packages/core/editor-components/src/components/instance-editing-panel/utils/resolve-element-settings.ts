import { type Props, type PropValue } from '@elementor/editor-props';

import { componentOverridablePropTypeUtil } from '../../../prop-types/component-overridable-prop-type';

export type OverridesMapping = {
	[ key: string ]: {
		value: unknown;
		outermostKey?: string;
	};
};

export function applyOverridesToSettings( elementSettings: Props, overrides: OverridesMapping ): Props {
	const result: Props = {};

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
			result[ propKey ] = {
				$$type: 'overridable',
				value: {
					override_key: override.outermostKey,
					origin_value: override.value ?? propValue,
				},
			} as PropValue;
		} else {
			result[ propKey ] = override.value ?? propValue;
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
