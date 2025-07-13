import * as React from 'react';
import { stringPropTypeUtil, type StringPropValue } from '@elementor/editor-props';
import { MenuListItem } from '@elementor/editor-ui';
import { Select, type SelectChangeEvent, Typography } from '@elementor/ui';

import { useBoundProp } from '../bound-prop-context';
import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';

type Props = {
	options: Array< { label: string; value: StringPropValue[ 'value' ]; disabled?: boolean } >;
	onChange?: ( newValue: string | null, previousValue: string | null | undefined ) => void;
};

export const SelectControl = createControl( ( { options, onChange }: Props ) => {
	const { value, setValue, disabled, placeholder } = useBoundProp( stringPropTypeUtil );
	const handleChange = ( event: SelectChangeEvent< StringPropValue[ 'value' ] > ) => {
		const newValue = event.target.value || null;

		onChange?.( newValue, value );
		setValue( newValue );
	};

	return (
		<ControlActions>
			<Select
				sx={ { overflow: 'hidden' } }
				displayEmpty
				size="tiny"
				renderValue={ ( selectedValue: string | null ) => {
					const findOptionByValue = ( searchValue: string | null ) =>
						options.find( ( opt ) => opt.value === searchValue );

					if ( ! selectedValue || selectedValue === '' ) {
						if ( placeholder ) {
							const placeholderOption = findOptionByValue( placeholder );
							const displayText = placeholderOption?.label || placeholder;

							return (
								<Typography component="span" variant="caption" color="text.tertiary">
									{ displayText }
								</Typography>
							);
						}
						return '';
					}
					const option = findOptionByValue( selectedValue );
					return option?.label || selectedValue;
				} }
				value={ value ?? '' }
				onChange={ handleChange }
				disabled={ disabled }
				fullWidth
			>
				{ options.map( ( { label, ...props } ) => (
					<MenuListItem key={ props.value } { ...props } value={ props.value ?? '' }>
						{ label }
					</MenuListItem>
				) ) }
			</Select>
		</ControlActions>
	);
} );
