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

export function shouldApplyEffect( { relation, terms }: Dependency, values: PropValue ): boolean {
	if ( ! terms.length ) {
		return false;
	}

	const method = getRelationMethod( relation );

	return terms[ method ]( ( term: ParsedTerm | Dependency ) =>
		isDependency( term )
			? shouldApplyEffect( term, values )
			: evaluateTerm( term, extractValue( term.path, values ) )
	);
}

export function evaluateTerm( term: DependencyTerm, actualValue: PropValue ) {
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

			return valueToCompare.includes( actualValue ) === ( 'in' === operator );

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
			return false;
	}
}

function isNumber( value: PropValue ): value is number {
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
	shouldResolveValue: boolean = true
): TransformablePropValue< PropKey > | null {
	return path.reduce( ( acc, key, index ) => {
		const value = acc?.[ key as keyof typeof acc ] as PropValue | undefined;

		return ( ( ! shouldResolveValue && index !== path.length - 1 ) || shouldResolveValue ) &&
			isTransformable( value )
			? value.value ?? value
			: value;
	}, elementValues ) as TransformablePropValue< PropKey >;
}

function isDependency( term: DependencyTerm | Dependency ): term is Dependency {
	return 'relation' in term;
}
