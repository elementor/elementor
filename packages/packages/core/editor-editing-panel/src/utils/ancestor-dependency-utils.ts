import { findClosestContainer, getContainer, getWidgetsCache, type V1Element } from '@elementor/editor-elements';
import { type PropType } from '@elementor/editor-props';

import { getElementSettingsWithDefaults, isHiddenByDependency } from './prop-dependency-utils';

function getSettingsWithDefaults( ancestor: V1Element, elementType: string ) {
	const schema = getWidgetsCache()?.[ elementType ]?.atomic_props_schema ?? {};
	const settings = Object.fromEntries(
		Object.keys( schema ).map( ( key ) => [ key, ancestor.settings.get( key ) ?? null ] )
	);

	return getElementSettingsWithDefaults( schema, settings );
}

export function isHiddenByAncestor( elementId: string, propType: PropType | undefined ): boolean {
	const ancestorDependency = propType?.meta?.ancestor_dependency;

	if ( ! Array.isArray( ancestorDependency?.dependency?.terms ) ) {
		return false;
	}

	const ancestor = findClosestContainer(
		getContainer( elementId )?.parent,
		( container ) => container.model.get( 'elType' ) === ancestorDependency.element_type
	);

	if ( ! ancestor ) {
		return false;
	}

	return isHiddenByDependency(
		ancestorDependency.dependency,
		getSettingsWithDefaults( ancestor, ancestorDependency.element_type )
	);
}
