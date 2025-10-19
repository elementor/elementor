import { type ElementType } from '../types';
import { getWidgetsCache } from './get-widgets-cache';

export function getElementType( type: string ): ElementType | null {
	if ( ! type ) {
		return null;
	}

	const widgetsCache = getWidgetsCache();
	const elementType = widgetsCache?.[ type ];

	if ( ! elementType?.atomic_controls ) {
		return null;
	}

	if ( ! elementType?.atomic_props_schema ) {
		return null;
	}

	return {
		key: type,
		controls: elementType.atomic_controls,
		propsSchema: elementType.atomic_props_schema,
		dependenciesPerTargetMapping: elementType.dependencies_per_target_mapping ?? {},
		title: elementType.title,
	};
}
