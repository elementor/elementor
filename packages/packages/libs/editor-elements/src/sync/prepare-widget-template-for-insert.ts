import { generateElementId } from './generate-element-id';
import { regenerateLocalStyleIds } from './regenerate-local-style-ids';
import { type V1ElementData, type WidgetDefinitionForInsert, type WidgetTemplateNode } from './types';

export function prepareWidgetTemplateForInsert( { id, version, template }: WidgetDefinitionForInsert ): V1ElementData {
	const root = assignIdsRecursive( structuredClone( template ) );

	return {
		...root,
		widget: { id, version, values: {} },
	};
}

function assignIdsRecursive( node: WidgetTemplateNode ): V1ElementData {
	const element: V1ElementData = {
		...node,
		id: generateElementId(),
		elements: ( node.elements ?? [] ).map( assignIdsRecursive ),
	};

	if ( ! element.styles ) {
		return element;
	}

	const { styles, settings } = regenerateLocalStyleIds( element );

	return {
		...element,
		styles,
		...( settings && { settings: { ...element.settings, ...settings } } ),
	};
}
