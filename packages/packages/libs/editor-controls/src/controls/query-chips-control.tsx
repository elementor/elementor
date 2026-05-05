import * as React from 'react';
import { type SyntheticEvent, useMemo } from 'react';
import {
	createArrayPropUtils,
	numberPropTypeUtil,
	queryPropTypeUtil,
	type QueryPropValue,
	stringPropTypeUtil,
} from '@elementor/editor-props';
import { Autocomplete, Chip, TextField } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useBoundProp } from '../bound-prop-context';
import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';
import { useQueryAutocomplete } from '../hooks/use-query-autocomplete';

type QueryChipsControlProps = {
	queryOptions: {
		params: Record< string, unknown >;
		url: string;
	};
	placeholder?: string;
	minInputLength?: number;
};

type ChipOption = {
	id: string;
	label: string;
};

const queryArrayPropTypeUtil = createArrayPropUtils( queryPropTypeUtil.key, queryPropTypeUtil.schema );

const SIZE = 'tiny';

export const QueryChipsControl = createControl( ( props: QueryChipsControlProps ) => {
	const { queryOptions, placeholder, minInputLength = 2 } = props;
	const { value, setValue, disabled } = useBoundProp( queryArrayPropTypeUtil );

	const selectedChips = useMemo< ChipOption[] >( () => extractChips( value ), [ value ] );

	const excludeIds = useMemo(
		() =>
			selectedChips.map( ( chip ) => Number( chip.id ) ).filter( ( id ): id is number => Number.isFinite( id ) ),
		[ selectedChips ]
	);

	const { options, updateOptions } = useQueryAutocomplete( {
		url: queryOptions.url,
		params: queryOptions.params,
		minInputLength,
		excludeIds,
	} );

	const handleChange = ( _: SyntheticEvent, newValue: ChipOption[] ) => {
		setValue(
			newValue.map( ( option ) =>
				queryPropTypeUtil.create( {
					id: numberPropTypeUtil.create( Number( option.id ) ),
					label: stringPropTypeUtil.create( option.label ),
				} )
			)
		);
	};

	const handleInputChange = ( _: SyntheticEvent, term: string ) => {
		updateOptions( term || null );
	};

	return (
		<ControlActions>
			<Autocomplete
				multiple
				fullWidth
				disableClearable
				forcePopupIcon={ false }
				disabled={ disabled }
				size={ SIZE }
				value={ selectedChips }
				options={ options as ChipOption[] }
				onChange={ handleChange }
				onInputChange={ handleInputChange }
				getOptionLabel={ ( option ) => option.label }
				isOptionEqualToValue={ ( option, val ) => option.id === val.id }
				filterOptions={ ( opts ) => opts }
				renderTags={ ( values, getTagProps ) =>
					values.map( ( option, index ) => {
						const { key, ...chipProps } = getTagProps( { index } );

						return (
							<Chip
								key={ key }
								size={ SIZE }
								label={ option.label }
								sx={ { borderRadius: 1 } }
								{ ...chipProps }
							/>
						);
					} )
				}
				renderInput={ ( params ) => (
					<TextField { ...params } placeholder={ placeholder ?? __( 'Search', 'elementor' ) } />
				) }
			/>
		</ControlActions>
	);
} );

function extractChips( value: QueryPropValue[] | null | undefined ): ChipOption[] {
	if ( ! value ) {
		return [];
	}

	return value
		.map( ( item ) => {
			const id = item?.value?.id?.value;
			const label = item?.value?.label?.value;

			if ( typeof id !== 'number' ) {
				return null;
			}

			return {
				id: String( id ),
				label: typeof label === 'string' ? label : String( id ),
			};
		} )
		.filter( ( chip ): chip is ChipOption => chip !== null );
}
