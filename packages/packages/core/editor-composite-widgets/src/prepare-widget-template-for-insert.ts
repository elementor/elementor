import {
	cloneElementTree,
	regenerateLocalStyleIds,
	type V1ElementData,
	type V1ElementModelProps,
} from '@elementor/editor-elements';

import { type CompositeWidgetDefinition } from './types';

type DefinitionForInsert = Pick< CompositeWidgetDefinition, 'id' | 'version' | 'template' >;

export function prepareWidgetTemplateForInsert( { id, version, template }: DefinitionForInsert ): V1ElementData {
	const tree = cloneElementTree( structuredClone( template ) as Partial< V1ElementModelProps > ) as V1ElementData;
	const root = regenerateLocalStyleIdsRecursive( tree );

	return {
		...root,
		elements: ( root.elements ?? [] ).map( lockPartsRecursive ),
		widget: { id, version },
	};
}

function lockPartsRecursive( element: V1ElementData ): V1ElementData {
	return {
		...element,
		...( element.part && { isLocked: true } ),
		elements: ( element.elements ?? [] ).map( lockPartsRecursive ),
	};
}

function regenerateLocalStyleIdsRecursive( element: V1ElementData ): V1ElementData {
	const { styles, settings } = regenerateLocalStyleIds( element );

	return {
		...element,
		...( styles && { styles } ),
		...( settings && { settings } ),
		elements: ( element.elements ?? [] ).map( regenerateLocalStyleIdsRecursive ),
	};
}
