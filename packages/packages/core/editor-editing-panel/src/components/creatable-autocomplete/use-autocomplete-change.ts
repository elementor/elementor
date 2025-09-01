import { type AutocompleteChangeDetails, type AutocompleteChangeReason } from '@elementor/ui';

import { removeInternalKeys } from './autocomplete-option-internal-properties';
import { type InternalOption, type OnSelect, type Option } from './types';

export function useAutocompleteChange< TOption extends Option >( params: {
	options: InternalOption< TOption >[];
	onSelect?: OnSelect< TOption >;
	createOption: ( ( value: string ) => Promise< unknown > ) | null;
	setInputValue: ( value: string ) => void;
	closeDropdown: () => void;
} ) {
	const { options, onSelect, createOption, setInputValue, closeDropdown } = params;

	if ( ! onSelect && ! createOption ) {
		return;
	}

	const handleChange = async (
		_: React.SyntheticEvent,
		selectedOrInputValue: Array< InternalOption< TOption > | string >,
		reason: AutocompleteChangeReason,
		details?: AutocompleteChangeDetails< InternalOption< TOption > | string >
	) => {
		const changedOption = details?.option;
		if ( ! changedOption || ( typeof changedOption === 'object' && changedOption.fixed ) ) {
			// If `changedOption` is nullish it means no option was selected, created or removed.
			// The reason is either "blur" which we don't support (can't be "clear" since we disabled it).
			// If the option is fixed, it can't be selected, created or removed.
			return;
		}

		const selectedOptions = selectedOrInputValue.filter( ( option ) => typeof option !== 'string' );

		switch ( reason ) {
			case 'removeOption':
				const removedOption = changedOption as InternalOption< TOption >;
				updateSelectedOptions( selectedOptions, 'removeOption', removedOption );
				break;

			// User clicked an option. It's either an existing option, or "Create <new option>".
			case 'selectOption': {
				const selectedOption = changedOption as InternalOption< TOption >;

				if ( selectedOption._action === 'create' ) {
					const newOption = selectedOption.value as string;
					return createOption?.( newOption );
				}

				updateSelectedOptions( selectedOptions, 'selectOption', selectedOption );
				break;
			}

			// User pressed "Enter" after typing input. The input is either matching existing option or a new option to create.
			case 'createOption': {
				const inputValue = changedOption as string;

				const matchingOption = options.find(
					( option ) => option.label.toLocaleLowerCase() === inputValue.toLocaleLowerCase()
				);
				if ( matchingOption ) {
					selectedOptions.push( matchingOption );
					updateSelectedOptions( selectedOptions, 'selectOption', matchingOption );
				} else {
					return createOption?.( inputValue );
				}
				break;
			}
		}

		setInputValue( '' );
		closeDropdown();
	};

	return handleChange;

	function updateSelectedOptions(
		selectedOptions: InternalOption< TOption >[],
		reason: AutocompleteChangeReason,
		changedOption: InternalOption< TOption >
	) {
		onSelect?.(
			selectedOptions.map( ( option ) => removeInternalKeys( option ) ),
			reason,
			removeInternalKeys( changedOption )
		);
	}
}
