import { type PropType, type PropValue } from '../types';
import { isTransformable } from './is-transformable';

export const PROP_TYPE_COMPATIBILITY_MAP: Record< string, string[] > = {
	html: [ 'string' ],
	string: [ 'html' ],
};

export function getCompatibleTypeKeys( propType: PropType ): string[] {
	if ( propType.kind === 'union' ) {
		return [];
	}

	const compatibleKeys = propType.meta?.compatibleTypeKeys as string[] | undefined;

	if ( Array.isArray( compatibleKeys ) ) {
		return compatibleKeys;
	}

	return PROP_TYPE_COMPATIBILITY_MAP[ propType.key ] ?? [];
}

export function migratePropValue( value: PropValue, propType: PropType ): PropValue {
	if ( ! isTransformable( value ) ) {
		return value;
	}

	if ( propType.kind === 'union' ) {
		const propTypes = propType.prop_types;

		for ( const unionPropType of Object.values( propTypes ) ) {
			const expectedKey = unionPropType.key;

			if ( value.$$type === expectedKey ) {
				return value;
			}

			const compatibleKeys = getCompatibleTypeKeys( unionPropType );

			if ( compatibleKeys.includes( value.$$type ) ) {
				return { ...value, $$type: expectedKey };
			}
		}
	} else {
		const expectedKey = propType.key;

		if ( value.$$type === expectedKey ) {
			return value;
		}

		const compatibleKeys = getCompatibleTypeKeys( propType );

		if ( compatibleKeys.includes( value.$$type ) ) {
			return { ...value, $$type: expectedKey };
		}
	}

	return value;
}
