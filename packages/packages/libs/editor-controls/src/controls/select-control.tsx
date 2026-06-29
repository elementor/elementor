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

		return (
			<ControlActions>
				<Select
					sx={ { overflow: 'hidden' } }
					displayEmpty
					size="tiny"
					MenuProps={ MenuProps }
					aria-label={ ariaLabel || placeholder }
					renderValue={ ( selectedValue: string | null ) =>
						getSelectRenderValue( options, placeholder, selectedValue )
					}
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

export function getSelectRenderValue(
	options: SelectOption[],
	placeholder: string | null | undefined,
	selectedValue: string | null
): React.ReactNode {
	const optionWithValue = ( v: string | null ) => options.find( ( { value } ) => value === v );

	if ( ! isUnsetSelectValue( selectedValue ) ) {
		return optionWithValue( selectedValue )?.label ?? selectedValue;
	}

	if ( placeholder ) {
		const text = optionWithValue( placeholder )?.label ?? placeholder;
		return (
			<Typography component="span" variant="inherit" color="text.tertiary">
				{ text }
			</Typography>
		);
	}

	return options.find( ( { value } ) => isUnsetSelectValue( value ) )?.label ?? '';
}

function isUnsetSelectValue( value: string | null | undefined ): boolean {
	return value === null || value === undefined || value === '';
}
