import { getElementSetting } from '@elementor/editor-elements';
import { type AnyTransformable } from '@elementor/editor-props';

import { componentOverridablePropTypeUtil } from '../prop-types/component-overridable-prop-type';
import { type OverridableProp } from '../types';

/**
 * Checks if an exposed prop's origin element setting is still overridable.
 *
 * An exposed prop becomes invalid when:
 * 1. The origin element no longer exists
 * 2. The origin setting is no longer marked as overridable (user deleted the overridable prop)
 * 3. The origin setting was deleted and re-created with a different override key
 *    (user deleted the overridable prop and then exposed the same setting again)
 *
 * @param prop - The exposed prop to check.
 * @return True if the origin element setting is still overridable, false otherwise.
 */
export function isOriginElementMatchingOverridableProp( prop: OverridableProp ): boolean {
	if ( ! prop.originPropFields ) {
		return true;
	}

	const { elementId, propKey, overrideKey } = prop.originPropFields;
	const setting = getElementSetting< AnyTransformable >( elementId, propKey );

	if ( ! setting || ! componentOverridablePropTypeUtil.isValid( setting ) ) {
		console.log( 'Origin element setting is not overridable', { setting, prop } );
		return false;
	}

	const elementSettingOverrideKey = setting.value.override_key;
	const expectedOverrideKey = overrideKey;

	const res = elementSettingOverrideKey === expectedOverrideKey;

	if ( ! res ) {
		console.log( 'Origin element setting override key is not matching', { setting, prop } );
	}

	return res;
}
