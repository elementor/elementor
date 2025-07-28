import {
	type Dependency,
	type DependencyTerm,
	type PropKey,
	type PropValue,
	type TransformablePropValue,
} from '../types';
import { isTransformable } from './is-transformable';

type ParsedTerm = DependencyTerm;

type Relation = Dependency[ 'relation' ];

export function isDependencyMet( dependency: Dependency | undefined, values: PropValue ): boolean {
	if ( ! dependency?.terms.length ) {
		return true;
	}

	const { relation, terms } = dependency;
	const method = getRelationMethod( relation );

	return terms[ method ]( ( term: ParsedTerm | Dependency ) =>
		isDependency( term )
			? isDependencyMet( term, values )
			: evaluateTerm( term, extractValue( term.path, values )?.value )
	);
}

export function evaluateTerm( term: DependencyTerm, actualValue: unknown ) {
	const { value: valueToCompare, operator } = term;

	switch ( operator ) {
		case 'eq':
		case 'ne':
			return ( actualValue === valueToCompare ) === ( 'eq' === operator );

		case 'gt':
		case 'lte':
			if ( ! isNumber( actualValue ) || ! isNumber( valueToCompare ) ) {
				return false;
			}

			return Number( actualValue ) > Number( valueToCompare ) === ( 'gt' === operator );

		case 'lt':
		case 'gte':
			if ( ! isNumber( actualValue ) || ! isNumber( valueToCompare ) ) {
				return false;
			}

			return Number( actualValue ) < Number( valueToCompare ) === ( 'lt' === operator );
		case 'in':
		case 'nin':
			if ( ! Array.isArray( valueToCompare ) ) {
				return false;
			}

			return valueToCompare.includes( actualValue as never ) === ( 'in' === operator );

		case 'contains':
		case 'ncontains':
			if (
				( 'string' !== typeof actualValue || 'string' !== typeof valueToCompare ) &&
				! Array.isArray( actualValue )
			) {
				return false;
			}

			return ( 'contains' === operator ) === actualValue.includes( valueToCompare as never );

		case 'exists':
		case 'not_exist':
			const evaluation = !! actualValue || 0 === actualValue || false === actualValue;

			return ( 'exists' === operator ) === evaluation;

		default:
			return true;
	}
}

function isNumber( value: unknown ): value is number {
	return typeof value === 'number' && ! isNaN( value );
}

function getRelationMethod( relation: Relation ) {
	switch ( relation ) {
		case 'or':
			return 'some';

		case 'and':
			return 'every';

		default:
			throw new Error( `Relation not supported ${ relation }` );
	}
}

export function extractValue( path: string[], elementValues: PropValue ): TransformablePropValue< PropKey > | null {
	return path.reduce( ( acc, key, index ) => {
		const value = acc?.[ key as keyof typeof acc ] as PropValue | null;

		return index !== path.length - 1 && isTransformable( value ) ? value.value ?? null : value;
	}, elementValues ) as TransformablePropValue< PropKey >;
}

export function isDependency( term: DependencyTerm | Dependency ): term is Dependency {
	return 'relation' in term;
}
