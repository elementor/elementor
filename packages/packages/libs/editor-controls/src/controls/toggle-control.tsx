import * as React from 'react';
import { type PropValue, stringPropTypeUtil, type StringPropValue } from '@elementor/editor-props';
import { AlertTriangleIcon, PhotoIcon } from '@elementor/icons';
import { type ToggleButtonProps } from '@elementor/ui';

import { useBoundProp } from '../bound-prop-context';
import { ControlToggleButtonGroup, type ToggleButtonGroupItem } from '../components/control-toggle-button-group';
import { createControl } from '../create-control';

type PhpOption = {
	value: string;
	label: string;
	icon?: string;
	showTooltip?: boolean;
	exclusive?: boolean;
};

// Icon mapping from eicon-* to React icons
const iconMapping: Record< string, React.ComponentType< any > > = {
	'eicon-video-camera': AlertTriangleIcon,
	'eicon-image-bold': PhotoIcon,
};

const convertPhpOptionsToToggleItems = (
	phpOptions: PhpOption[]
): Array< ToggleButtonGroupItem< string > & { exclusive?: boolean } > => {
	return phpOptions.map( ( option ) => {
		const IconComponent = option.icon ? iconMapping[ option.icon ] : null;

		return {
			value: option.value,
			label: option.label,
			renderContent: ( { size } ) => {
				if ( IconComponent ) {
					return <IconComponent fontSize={ size } />;
				}
				return option.label;
			},
			showTooltip: option.showTooltip,
			exclusive: option.exclusive,
		};
	} );
};

export type ToggleControlProps< T extends PropValue > = {
	options: Array< ToggleButtonGroupItem< T > & { exclusive?: boolean } >;
	fullWidth?: boolean;
	size?: ToggleButtonProps[ 'size' ];
	exclusive?: boolean;
	maxItems?: number;
	convertOptions?: boolean;
};

export const ToggleControl = createControl(
	( {
		options,
		fullWidth = false,
		size = 'tiny',
		exclusive = true,
		maxItems,
		convertOptions = false,
	}: ToggleControlProps< StringPropValue[ 'value' ] > ) => {
		const { value, setValue, placeholder, disabled } = useBoundProp( stringPropTypeUtil );

		const processedOptions = convertOptions
			? convertPhpOptionsToToggleItems( options as unknown as PhpOption[] )
			: options;

		const exclusiveValues = processedOptions
			.filter( ( option ) => option.exclusive )
			.map( ( option ) => option.value );

		const handleNonExclusiveToggle = ( selectedValues: StringPropValue[ 'value' ][] ) => {
			const newSelectedValue = selectedValues[ selectedValues.length - 1 ];
			const isNewSelectedValueExclusive = exclusiveValues.includes( newSelectedValue );

			const updatedValues = isNewSelectedValueExclusive
				? [ newSelectedValue ]
				: selectedValues?.filter( ( val ) => ! exclusiveValues.includes( val ) );

			setValue( updatedValues?.join( ' ' ) || null );
		};

		const toggleButtonGroupProps = {
			items: processedOptions,
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
