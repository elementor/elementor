import { type TVariable, type TVariablesList } from '../storage';
import { type NormalizedVariable } from '../types';
import { type VariableTypesMap } from '../variables-registry/create-variable-type-registry';

export type VariableWithKey = TVariable & { key: string };

export const variablesToList = ( variables: TVariablesList ): VariableWithKey[] => {
	return Object.entries( variables ).map( ( [ key, variable ] ) => ( { key, ...variable } ) );
};

export const toNormalizedVariable = ( { key, label, value, order }: VariableWithKey ): NormalizedVariable => ( {
	key,
	label,
	value,
	order,
} );

type VariableWithType = NormalizedVariable & { type: string };

export const applySelectionFilters = (
	variables: VariableWithKey[],
	variableTypes: VariableTypesMap
): VariableWithType[] => {
	const grouped: Record< string, VariableWithKey[] > = {};
	variables.forEach( ( item ) => ( grouped[ item.type ] ??= [] ).push( item ) );

	return Object.entries( grouped ).flatMap( ( [ type, vars ] ) => {
		const filter = variableTypes[ type ]?.selectionFilter;
		const normalized = vars.map( toNormalizedVariable );

		return ( filter?.( normalized ) ?? normalized ).map( ( v ) => ( { ...v, type } ) );
	} );
};
