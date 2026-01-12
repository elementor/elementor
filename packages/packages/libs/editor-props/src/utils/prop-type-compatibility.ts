import { type ExtendedWindow, type PropType, type PropValue } from '../types';
import { isTransformable } from './is-transformable';

const extendedWindow = window as ExtendedWindow;

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

export function getFilteredDynamicSettings( value: PropValue ) {
	if ( ! value || ! isTransformable( value ) || ! value?.value ) {
		return value;
	}

	if ( value?.$$type !== 'dynamic' ) {
		return value;
	}

	const dynamicValue = value.value as typeof value.value & { name: string };
	const dynamicTags = extendedWindow.elementor?.config?.atomicDynamicTags?.tags || {};
	const tagName = dynamicTags[ dynamicValue.name ] ?? null;

	return tagName ? value : null;
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
