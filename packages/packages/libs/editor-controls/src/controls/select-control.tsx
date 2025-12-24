import * as React from 'react';
import { stringPropTypeUtil, type StringPropValue } from '@elementor/editor-props';
import { MenuListItem } from '@elementor/editor-ui';
import { Select, type SelectChangeEvent, type SelectProps, Typography } from '@elementor/ui';

import { useBoundProp } from '../bound-prop-context';
import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';

export type SelectOption = {
	label: string;
	value: StringPropValue[ 'value' ];
	disabled?: boolean;
};

export type SelectControlProps = {
	options: SelectOption[];
	onChange?: ( newValue: string | null, previousValue: string | null | undefined ) => void;
	MenuProps?: SelectProps[ 'MenuProps' ];
	ariaLabel?: string;
};

const DEFAULT_MENU_PROPS = {
	MenuListProps: {
		sx: {
			maxHeight: '160px',
		},
	},
};

export const SelectControl = createControl(
	( { options, onChange, MenuProps = DEFAULT_MENU_PROPS, ariaLabel }: SelectControlProps ) => {
		const { value, setValue, disabled, placeholder } = useBoundProp( stringPropTypeUtil );
		const handleChange = ( event: SelectChangeEvent< StringPropValue[ 'value' ] > ) => {
			const newValue = event.target.value || null;

			onChange?.( newValue, value );
			setValue( newValue );
		};
		const isDisabled = disabled || options.length === 0;

		return (
			<ControlActions>
				<Select
					sx={ { overflow: 'hidden' } }
					displayEmpty
					size="tiny"
					MenuProps={ MenuProps }
					aria-label={ ariaLabel || placeholder }
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
					disabled={ isDisabled }
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
	}
);
