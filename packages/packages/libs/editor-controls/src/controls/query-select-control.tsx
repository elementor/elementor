import * as React from 'react';
import { type SyntheticEvent, useMemo } from 'react';
import { numberPropTypeUtil, queryPropTypeUtil, stringPropTypeUtil } from '@elementor/editor-props';
import { Autocomplete, TextField } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useBoundProp } from '../bound-prop-context';
import { type FlatOption } from '../components/autocomplete';
import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';
import { extractFlatOptionFromQueryValue, useQueryAutocomplete } from '../hooks/use-query-autocomplete';

type QuerySelectControlProps = {
	queryOptions: {
		params: Record< string, unknown >;
		url: string;
	};
	placeholder?: string;
	minInputLength?: number;
	ariaLabel?: string;
};

const SIZE = 'tiny';

export const QuerySelectControl = createControl( ( props: QuerySelectControlProps ) => {
	const { queryOptions, placeholder, minInputLength = 0, ariaLabel } = props;
	const { value, setValue, disabled } = useBoundProp( queryPropTypeUtil );

	const selectedOption = useMemo( () => extractFlatOptionFromQueryValue( value ), [ value ] );

	const { options, updateOptions } = useQueryAutocomplete( {
		url: queryOptions.url,
		params: queryOptions.params,
		minInputLength,
		initialQueryValue: value,
	} );

	const optionsWithSelected = useMemo(
		() => withSelectedOption( options as FlatOption[], selectedOption ),
		[ options, selectedOption ]
	);

	const handleChange = ( _: SyntheticEvent, newValue: FlatOption | null ) => {
		if ( ! newValue ) {
			setValue( null );

			return;
		}

		setValue( {
			id: numberPropTypeUtil.create( Number( newValue.id ) ),
			label: stringPropTypeUtil.create( newValue.label ),
		} );
	};

	const handleInputChange = ( _: SyntheticEvent, term: string, reason: string ) => {
		if ( 'reset' === reason || 'clear' === reason ) {
			updateOptions( null );
			return;
		}

		if ( 'input' !== reason ) {
			return;
		}

		updateOptions( term || null );
	};

	return (
		<ControlActions>
			<Autocomplete
				fullWidth
				openOnFocus
				disabled={ disabled }
				size={ SIZE }
				value={ selectedOption }
				options={ optionsWithSelected }
				onChange={ handleChange }
				onInputChange={ handleInputChange }
				getOptionLabel={ ( option ) => option.label }
				isOptionEqualToValue={ ( option, val ) => option.id === val.id }
				filterOptions={ ( opts ) => opts }
				renderInput={ ( params ) => (
					<TextField
						{ ...params }
						placeholder={ placeholder ?? __( 'Search', 'elementor' ) }
						inputProps={ {
							...params.inputProps,
							...( ariaLabel ? { 'aria-label': ariaLabel } : {} ),
						} }
					/>
				) }
			/>
		</ControlActions>
	);
} );

function withSelectedOption( options: FlatOption[], selectedOption: FlatOption | null ): FlatOption[] {
	if ( ! selectedOption || options.some( ( option ) => option.id === selectedOption.id ) ) {
		return options;
	}

	return [ selectedOption, ...options ];
}
