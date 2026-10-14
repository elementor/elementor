import { getWidgetsCache } from '@elementor/editor-elements';
import { type PropsSchema } from '@elementor/editor-props';

function buildAliasToCanonicalMap( schema: PropsSchema ): Record< string, string > {
	const aliasToCanonical: Record< string, string > = {};

	for ( const [ canonical, propType ] of Object.entries( schema ) ) {
		const aliases = propType.meta?.aliases;

		if ( ! Array.isArray( aliases ) ) {
			continue;
		}

		for ( const alias of aliases ) {
			if ( typeof alias === 'string' && alias ) {
				aliasToCanonical[ alias ] = canonical;
			}
		}
	}

	return aliasToCanonical;
}

export function resolveCanonicalPropName( elementType: string, propertyName: string ): string {
	const schema = getWidgetsCache()?.[ elementType ]?.atomic_props_schema;

	if ( ! schema || schema[ propertyName ] ) {
		return propertyName;
	}

	return buildAliasToCanonicalMap( schema )[ propertyName ] ?? propertyName;
}

export function resolveCanonicalPropKeys(
	elementType: string,
	props: Record< string, unknown >
): Record< string, unknown > {
	const schema = getWidgetsCache()?.[ elementType ]?.atomic_props_schema;

	if ( ! schema ) {
		return { ...props };
	}

	const aliasToCanonical = buildAliasToCanonicalMap( schema );
	const resolved: Record< string, unknown > = {};

	for ( const [ key, value ] of Object.entries( props ) ) {
		if ( schema[ key ] ) {
			resolved[ key ] = value;
		}
	}

	for ( const [ key, value ] of Object.entries( props ) ) {
		if ( schema[ key ] ) {
			continue;
		}

		const canonical = aliasToCanonical[ key ];

		if ( ! canonical ) {
			resolved[ key ] = value;
			continue;
		}

		if ( ! Object.prototype.hasOwnProperty.call( resolved, canonical ) ) {
			resolved[ canonical ] = value;
		}
	}

	return resolved;
}
