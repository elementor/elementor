import { generateElementId, type V1ElementData } from '@elementor/editor-elements';

import {
	type ComponentInstanceOverrideProp,
	componentInstanceOverridePropTypeUtil,
} from '../../prop-types/component-instance-override-prop-type';
import { type ComponentInstanceOverride } from '../../prop-types/component-instance-overrides-prop-type';
import { componentOverridablePropTypeUtil } from '../../prop-types/component-overridable-prop-type';
import { regenerateLocalStyleIds } from './regenerate-local-style-ids';
import { resolveOverridableSettings } from './resolve-overridable-settings';

/**
 * Creates detached element from component instance
 * by applying overrides, reverting overridables, and regenerating IDs.
 * This is used when detaching a component instance from its origin component.
 *
 * The function goes through all nested elements recursively and:
 * - Regenerates element IDs and local style IDs
 * - Resolves overridable settings - applies all instance overrides to element settings,
 * or replaces overridable with origin_value when no matching override exists.
 *
 * @param element   - The component's root element
 * @param overrides - Array of overrides from the component instance
 * @return A new element data with all overrides applied and new IDs
 */
export function resolveDetachedInstance(
	element: V1ElementData,
	overrides: ComponentInstanceOverride[]
): V1ElementData {
	const overrideMap = createOverrideMap( overrides );

	return resolveElementRecursive( structuredClone( element ), overrideMap );
}

function resolveElementRecursive(
	element: V1ElementData,
	overrideMap: Map< string, ComponentInstanceOverrideProp >
): V1ElementData {
	element.id = generateElementId();

	if ( element.styles ) {
		const { styles, settings } = regenerateLocalStyleIds( element );

		element.styles = styles;
		if ( settings ) {
			element.settings = { ...element.settings, ...settings };
		}
	}

	if ( element.settings ) {
		element.settings = resolveOverridableSettings( element, overrideMap );
	}

	if ( element.elements?.length ) {
		element.elements = element.elements.map( ( child ) => resolveElementRecursive( child, overrideMap ) );
	}

	return element;
}

function createOverrideMap( overrides: ComponentInstanceOverride[] ): Map< string, ComponentInstanceOverrideProp > {
	const map = new Map< string, ComponentInstanceOverrideProp >();

	overrides.forEach( ( item ) => {
		if ( componentInstanceOverridePropTypeUtil.isValid( item ) ) {
			map.set( item.value.override_key, item );
		} else if ( componentOverridablePropTypeUtil.isValid( item ) ) {
			const override = item.value.origin_value;
			if ( override && componentInstanceOverridePropTypeUtil.isValid( override ) ) {
				map.set( override.value.override_key, override );
			}
		}
	} );

	return map;
}
