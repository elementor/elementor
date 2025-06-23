import { createFilterOptions } from '@elementor/ui';

import { type InternalOption, type Option } from './types';

export function useFilterOptions< TOption extends Option >( parameters: {
	options: TOption[];
	selected: TOption[];
	onCreate?: ( value: string ) => Promise< unknown > | unknown;
	entityName?: { singular: string; plural: string };
} ) {
	const { options, selected, onCreate, entityName } = parameters;

	const filter = createFilterOptions< InternalOption< TOption > >();

	const filterOptions = (
		optionList: InternalOption< TOption >[],
		params: {
			inputValue: string;
			getOptionLabel: ( option: InternalOption< TOption > ) => string;
		}
	) => {
		const selectedValues = selected.map( ( option ) => option.value );

		const filteredOptions = filter(
			optionList.filter( ( option ) => ! selectedValues.includes( option.value ) ),
			params
		);

		const isExisting = options.some( ( option ) => params.inputValue === option.label );
		const allowCreate =
			Boolean( onCreate ) &&
			params.inputValue !== '' &&
			! selectedValues.includes( params.inputValue ) &&
			! isExisting;

		if ( allowCreate ) {
			filteredOptions.unshift( {
				label: `Create "${ params.inputValue }"`,
				value: params.inputValue,
				_group: `Create a new ${ entityName?.singular ?? 'option' }`,
				key: `create-${ params.inputValue }`,
				_action: 'create',
			} as InternalOption< TOption > );
		}

		return filteredOptions;
	};

	return filterOptions;
}
