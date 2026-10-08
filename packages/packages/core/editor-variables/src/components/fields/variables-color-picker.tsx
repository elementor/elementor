/* eslint-disable local-rules/no-path-imports -- Fork of @elementor/ui ColorPicker using VariablesColorBox */
import * as React from 'react';
import { bindPopover, bindTrigger, usePopupState } from '@elementor/ui';
import ColorIndicator from '@elementor/ui/unstable/components/ColorPicker/components/ColorIndicator';
import ColorPopover from '@elementor/ui/unstable/components/ColorPicker/components/ColorPopover';

import { VariablesColorBox } from './variables-color-box';

type VariablesColorPickerProps = {
	value?: string;
	onChange: ( value: string ) => void;
	size?: 'tiny' | 'small' | 'medium' | 'large' | 'inherit';
	disabled?: boolean;
	anchorEl?: HTMLElement | null;
	anchorOrigin?: {
		vertical: number | 'top' | 'center' | 'bottom';
		horizontal: number | 'left' | 'center' | 'right';
	};
	transformOrigin?: {
		vertical: number | 'top' | 'center' | 'bottom';
		horizontal: number | 'left' | 'center' | 'right';
	};
	anchorReference?: 'anchorEl' | 'anchorPosition' | 'none';
	anchorPosition?: { top: number; left: number };
	hideInputFields?: boolean;
	disableOpacity?: boolean;
	formats?: string[];
	slotProps?: {
		colorIndicator?: Record< string, unknown >;
		popover?: Record< string, unknown >;
	};
	indicatorShape?: 'circle' | 'square';
};

export const VariablesColorPicker = React.forwardRef< HTMLButtonElement, VariablesColorPickerProps >(
	( props, ref ) => {
		const {
			size,
			anchorEl,
			anchorOrigin,
			anchorReference,
			anchorPosition,
			transformOrigin,
			hideInputFields = false,
			slotProps = {},
			value = '',
			onChange,
			disabled,
			indicatorShape,
			disableOpacity,
			formats,
		} = props;

		const popoverState = usePopupState( {
			variant: 'popover',
			popupId: 'eui-color-picker-popover',
		} );

		const popoverProps = Object.entries( {
			anchorEl,
			anchorOrigin,
			anchorReference,
			anchorPosition,
			transformOrigin,
		} ).reduce< Record< string, unknown > >(
			( acc, [ key, val ] ) => ( val ? { ...acc, [ key ]: val } : acc ),
			{}
		);

		return (
			<>
				<ColorIndicator
					ref={ ref }
					size={ size }
					value={ value }
					component="button"
					disabled={ disabled }
					shape={ indicatorShape }
					{ ...bindTrigger( popoverState ) }
					{ ...slotProps.colorIndicator }
				/>
				<ColorPopover { ...bindPopover( popoverState ) } { ...popoverProps } { ...slotProps.popover }>
					<VariablesColorBox
						value={ value }
						onChange={ onChange }
						hideInputFields={ hideInputFields }
						disableOpacity={ disableOpacity }
						formats={ formats }
					/>
				</ColorPopover>
			</>
		);
	}
);

VariablesColorPicker.displayName = 'VariablesColorPicker';
