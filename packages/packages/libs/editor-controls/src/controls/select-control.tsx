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

type SelectControlProps = {
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

		const normalizeSelectValue = ( v: string | null | undefined ) =>
			v === null || v === undefined || v === '' ? null : v;

		const findOptionByValue = ( searchValue: string | null | undefined ) =>
			options.find( ( opt ) => normalizeSelectValue( opt.value ) === normalizeSelectValue( searchValue ) );

		return (
			<ControlActions>
				<Select
					sx={ { overflow: 'hidden' } }
					displayEmpty
					size="tiny"
					MenuProps={ MenuProps }
					aria-label={ ariaLabel || placeholder }
					renderValue={ ( selectedValue: string | null ) => {
						const isEmpty = ! selectedValue || selectedValue === '';

						if ( isEmpty && placeholder ) {
							const placeholderOption = findOptionByValue( placeholder );
							const displayText = placeholderOption?.label || placeholder;

							return (
								<Typography component="span" variant="caption" color="text.tertiary">
									{ displayText }
								</Typography>
							);
						}

						const option = findOptionByValue( selectedValue );

						if ( option ) {
							return option.label;
						}

						if ( isEmpty ) {
							return '';
						}

						return selectedValue;
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
