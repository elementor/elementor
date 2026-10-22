import { getContainer, getWidgetsCache, type V1Element } from '@elementor/editor-elements';
import {
	type Dependency,
	isDependency,
	isDependencyMet,
	type Props,
	type PropsSchema,
	type PropType,
} from '@elementor/editor-props';

import { getElementSettingsWithDefaults } from './prop-dependency-utils';

export type AncestorDependency = {
	element_type: string;
	dependency: Dependency;
};

export function getAncestorDependency( propType: PropType | undefined ): AncestorDependency | null {
	const candidate = propType?.meta?.ancestor_dependency as Partial< AncestorDependency > | undefined;

	if ( ! candidate || typeof candidate.element_type !== 'string' || ! Array.isArray( candidate.dependency?.terms ) ) {
		return null;
	}

	return candidate as AncestorDependency;
}

// Matches by `elType` only, so nesting the same type can resolve the wrong ancestor.
export function findAncestorContainer( elementId: string, elementType: string ): V1Element | null {
	let ancestor = getContainer( elementId )?.parent ?? null;

	while ( ancestor ) {
		if ( ancestor.model.get( 'elType' ) === elementType ) {
			return ancestor;
		}

		ancestor = ancestor.parent ?? null;
	}

	return null;
}

function getSettingsWithDefaults( container: V1Element, elementType: string ) {
	const schema = ( getWidgetsCache()?.[ elementType ]?.atomic_props_schema ?? {} ) as PropsSchema;
	const settings = ( container.settings?.toJSON?.() ?? {} ) as Props;
	const normalized = Object.fromEntries( Object.keys( schema ).map( ( key ) => [ key, settings[ key ] ?? null ] ) );

	return getElementSettingsWithDefaults( schema, normalized );
}

export function isHiddenByAncestor( elementId: string, propType: PropType | undefined ): boolean {
	const ancestorDependency = getAncestorDependency( propType );

	if ( ! ancestorDependency ) {
		return false;
	}

	const ancestor = findAncestorContainer( elementId, ancestorDependency.element_type );

	if ( ! ancestor ) {
		return false;
	}

	const depCheck = isDependencyMet(
		ancestorDependency.dependency,
		getSettingsWithDefaults( ancestor, ancestorDependency.element_type )
	);

	const failingTerm = ! depCheck.isMet ? depCheck.failingDependencies[ 0 ] : undefined;

	return !! failingTerm && ! isDependency( failingTerm ) && failingTerm.effect === 'hide';
}
