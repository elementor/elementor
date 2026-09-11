import { type PropType, type UnionPropType } from '@elementor/editor-props';

export function isResponsivePropType( propType: PropType | undefined ): boolean {
	if ( ! propType ) {
		return false;
	}

	if ( propType.meta?.responsive === true ) {
		return true;
	}

	if ( propType.kind === 'union' ) {
		return Object.values( ( propType as UnionPropType ).prop_types ).some( ( inner ) =>
			isResponsivePropType( inner )
		);
	}

	return false;
}
