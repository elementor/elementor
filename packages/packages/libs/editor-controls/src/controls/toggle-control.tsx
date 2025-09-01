import * as React from 'react';
import { type PropValue, stringPropTypeUtil, type StringPropValue } from '@elementor/editor-props';
import { type ToggleButtonProps } from '@elementor/ui';

import { useBoundProp } from '../bound-prop-context';
import { ControlToggleButtonGroup, type ToggleButtonGroupItem } from '../components/control-toggle-button-group';
import { createControl } from '../create-control';

export type ToggleControlProps< T extends PropValue > = {
	options: Array< ToggleButtonGroupItem< T > & { exclusive?: boolean } >;
	fullWidth?: boolean;
	size?: ToggleButtonProps[ 'size' ];
	exclusive?: boolean;
	maxItems?: number;
};

export const ToggleControl = createControl(
	( {
		options,
		fullWidth = false,
		size = 'tiny',
		exclusive = true,
		maxItems,
	}: ToggleControlProps< StringPropValue[ 'value' ] > ) => {
		const { value, setValue, placeholder, disabled } = useBoundProp( stringPropTypeUtil );

		const exclusiveValues = options.filter( ( option ) => option.exclusive ).map( ( option ) => option.value );

		const handleNonExclusiveToggle = ( selectedValues: StringPropValue[ 'value' ][] ) => {
			const newSelectedValue = selectedValues[ selectedValues.length - 1 ];
			const isNewSelectedValueExclusive = exclusiveValues.includes( newSelectedValue );

			const updatedValues = isNewSelectedValueExclusive
				? [ newSelectedValue ]
				: selectedValues?.filter( ( val ) => ! exclusiveValues.includes( val ) );

			setValue( updatedValues?.join( ' ' ) || null );
		};

		const toggleButtonGroupProps = {
			items: options,
			maxItems,
			fullWidth,
			size,
			placeholder,
		};

		return exclusive ? (
			<ControlToggleButtonGroup
				{ ...toggleButtonGroupProps }
				value={ value ?? null }
				onChange={ setValue }
				disabled={ disabled }
				exclusive={ true }
			/>
		) : (
			<ControlToggleButtonGroup
				{ ...toggleButtonGroupProps }
				value={ value?.split( ' ' ) ?? [] }
				onChange={ handleNonExclusiveToggle }
				disabled={ disabled }
				exclusive={ false }
			/>
		);
	}
);
