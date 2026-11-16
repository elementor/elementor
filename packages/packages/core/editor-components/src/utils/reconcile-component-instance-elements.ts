import {
	getWidgetsCache,
	reconcileInitialChildren,
	type V1ElementConfig,
	type V1ElementData,
	type V1ElementSettingsProps,
} from '@elementor/editor-elements';
import { type AnyTransformable } from '@elementor/editor-props';
import { hashString } from '@elementor/utils';

import {
	applyOverridesToSettings,
	type ElementSettings,
	type OverridesMapping,
	unwrapOverridableSettings,
} from '../components/instance-editing-panel/utils/resolve-element-settings';

const ELEMENT_ID_LENGTH = 7;

function overridesRecordToMapping( overrides: Record< string, unknown > ): OverridesMapping {
	const mapping: OverridesMapping = {};

	for ( const [ key, value ] of Object.entries( overrides ) ) {
		mapping[ key ] = { value: value as AnyTransformable };
	}

	return mapping;
}

function getElementConfig( element: V1ElementData ): V1ElementConfig | undefined {
	const type = element.elType === 'widget' ? element.widgetType : element.elType;

	if ( ! type ) {
		return undefined;
	}

	return getWidgetsCache()?.[ type ];
}

/**
 * Children inserted by dependency rules come from static `default_model` config, so
 * `reconcileInitialChildren` gives them random ids. Replace them with ids derived from the
 * parent id and the position in the subtree, so the instance-scoped hashing applied later by
 * `formatComponentElementsId` is stable across renders. Keep in sync with `derive_ids()` in
 * `modules/components/utils/reconcile-component-instance-elements.php`.
 *
 * Instance children are not directly editable, so overwriting the ids of a model that
 * `reconcileInitialChildren` restored from the stash is safe and keeps the canvas aligned
 * with the render, which has no stash to restore from.
 *
 * @param element The inserted element to assign ids to, recursively.
 * @param seed    Stable string the element's id is hashed from.
 */
function deriveIds( element: V1ElementData, seed: string ): V1ElementData {
	const id = hashString( seed, ELEMENT_ID_LENGTH );

	return {
		...element,
		id,
		elements: ( element.elements ?? [] ).map( ( child, index ) => deriveIds( child, `${ id }_${ index }` ) ),
	};
}

function reconcileElementTree( element: V1ElementData, overridesMapping: OverridesMapping ): V1ElementData {
	const elementConfig = getElementConfig( element );
	const withOverrides = applyOverridesToSettings( ( element.settings ?? {} ) as ElementSettings, overridesMapping );
	const effectiveSettings = unwrapOverridableSettings( withOverrides ) as V1ElementSettingsProps;

	const originalChildren = element.elements ?? [];
	const originalChildIds = new Set( originalChildren.map( ( child ) => child.id ) );

	const attributes: {
		elements?: V1ElementData[];
		settings?: V1ElementSettingsProps;
	} = {
		elements: [ ...originalChildren ],
		settings: effectiveSettings,
	};

	if ( elementConfig?.children_dependencies?.length ) {
		reconcileInitialChildren( {
			elementId: element.id,
			elementConfig,
			attributes,
		} );
	}

	const reconciledChildren = ( attributes.elements ?? [] )
		.map( ( child ) =>
			originalChildIds.has( child.id ) ? child : deriveIds( child, `${ element.id }_${ child.elType }` )
		)
		.map( ( child ) => reconcileElementTree( child, overridesMapping ) );

	return {
		...element,
		elements: reconciledChildren,
	};
}

export function reconcileComponentInstanceElements(
	elements: V1ElementData[],
	overrides: Record< string, unknown > = {}
): V1ElementData[] {
	const overridesMapping = overridesRecordToMapping( overrides );

	return elements.map( ( element ) => reconcileElementTree( element, overridesMapping ) );
}
