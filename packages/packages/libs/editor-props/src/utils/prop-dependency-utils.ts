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

export function isDependencyMet(
	dependency: Dependency | undefined,
	values: PropValue
): { isMet: true } | { isMet: false; failingDependencies: DependencyTerm[] } {
	if ( ! dependency?.terms.length ) {
		return { isMet: true };
	}

	const { relation, terms } = dependency;
	const method = getRelationMethod( relation );

	const failingDependencies: DependencyTerm[] = [];
	const isMet = terms[ method ]( ( term: ParsedTerm | Dependency ) => {
		const isNestedDependency = isDependency( term );
		const result = isNestedDependency
			? isDependencyMet( term, values ).isMet
			: evaluateTerm( term, extractValue( term.path, values, term.nestedPath )?.value );

		if ( ! result ) {
			failingDependencies.push( term );
		}

		return result;
	} );

	return { isMet, failingDependencies };
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

export function extractValue(
	path: string[],
	elementValues: PropValue,
	nestedPath: string[] = []
): TransformablePropValue< PropKey > | null {
	const extractedValue = path.reduce( ( acc, key, index ) => {
		const value = acc?.[ key as keyof typeof acc ] as PropValue | null;

		return index !== path.length - 1 && isTransformable( value ) ? value.value ?? null : value;
	}, elementValues ) as TransformablePropValue< PropKey >;

	if ( ! nestedPath?.length ) {
		return extractedValue;
	}

	const nestedValue = nestedPath.reduce(
		( acc: Record< string, unknown >, key ) => acc?.[ key ] as Record< string, unknown >,
		extractedValue?.value as Record< string, unknown >
	);

	return {
		$$type: 'unknown',
		value: nestedValue,
	};
}

export function isDependency( term: DependencyTerm | Dependency ): term is Dependency {
	return 'terms' in term;
}
