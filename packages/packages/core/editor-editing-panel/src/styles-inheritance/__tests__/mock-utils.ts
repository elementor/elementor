import { createMockBreakpointsTree } from 'test-utils';
import { isTransformable, type PropValue } from '@elementor/editor-props';
import { getVariantByMeta, type StyleDefinition, type StyleDefinitionVariant } from '@elementor/editor-styles';

import { createStylesInheritance } from '../create-styles-inheritance';
import type { SnapshotPropValue, StylesInheritanceSnapshot } from '../types';

export function createMockSnapshot(
	styles: StyleDefinition[],
	meta: StyleDefinitionVariant[ 'meta' ]
): StylesInheritanceSnapshot | undefined {
	const { getSnapshot } = createStylesInheritance( styles, createMockBreakpointsTree() );

	return getSnapshot( meta );
}
export function createMockSnapshotField(
	style: StyleDefinition,
	meta: StyleDefinitionVariant[ 'meta' ],
	path: string[],
	provider: string | null = 'test'
) {
	const variant = getVariantByMeta( style, meta );

	const [ field ] = path;
	const value = variant?.props[ field ];

	return {
		style,
		provider,
		variant,
		value: path.length > 1 ? getValueByPath( value, path ) : value,
	} as SnapshotPropValue;
}

// duplicated as it's a global test util and the original method has no point in being exported (.../create-styles-inheritance.ts)
function getValueByPath( value: PropValue, path: string[] ): PropValue {
	if ( ! value || typeof value !== 'object' ) {
		return null;
	}

	return path.slice( 1 ).reduce( ( currentScope: PropValue, key: string ): PropValue | null => {
		if ( ! currentScope ) {
			return null;
		}

		if ( isTransformable( currentScope ) ) {
			return currentScope.value?.[ key ];
		}

		if ( typeof currentScope === 'object' ) {
			return currentScope[ key as keyof typeof currentScope ];
		}

		return null;
	}, value );
}
