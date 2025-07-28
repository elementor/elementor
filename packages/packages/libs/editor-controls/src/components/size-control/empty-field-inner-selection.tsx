import * as React from 'react';
import { forwardRef } from 'react';
import { type PropValue } from '@elementor/editor-props';
import { Box, type TextFieldProps, type Theme } from '@elementor/ui';

import { type ExtendedOption, type Unit } from '../../utils/size-control';

type NonEditableInputProps = {
	value: PropValue;
	onClick?: ( event: React.MouseEvent< HTMLElement > ) => void;
	disabled?: boolean;
	isPopoverOpen?: boolean;
	unit?: Unit | ExtendedOption;
	inputProps: TextFieldProps[ 'InputProps' ] & {
		endAdornment: React.ReactNode;
	};
};

export const NonEditableInput = forwardRef< HTMLDivElement, NonEditableInputProps >(
	( { value, onClick, disabled, isPopoverOpen = false, unit, inputProps }, ref ) => {
		const handleClick = ( event: React.MouseEvent< HTMLElement > ) => {
			// Check if click is on the unit selector (endAdornment area)
			const target = event.target as HTMLElement;
			const isUnitSelectorClick =
				target.closest( '[data-testid="unit-selector"]' ) ||
				target.closest( 'button' ) ||
				target.tagName === 'BUTTON';

			// Only allow click for custom units, not auto, and not on unit selector
			if ( unit === 'custom' && onClick && ! disabled && ! isUnitSelectorClick ) {
				onClick( event );
			}
		};

		// Disable unit selector when popover is open
		const modifiedInputProps = {
			...inputProps,
			endAdornment: React.cloneElement( inputProps.endAdornment as React.ReactElement, {
				disabled: disabled || isPopoverOpen,
			} ),
		};

		const getCursor = () => {
			if ( disabled ) {
				return 'default';
			}
			if ( unit === 'custom' ) {
				return 'pointer';
			}
			return 'default';
		};

		return (
			<Box
				ref={ ref }
				onClick={ handleClick }
				data-testid="non-editable-input"
				sx={ ( theme: Theme ) => ( {
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					height: 28,
					paddingRight: 0,
					paddingLeft: 0,
					borderRadius: '8px',
					border: 1,
					borderStyle: 'solid',
					borderColor: isPopoverOpen ? theme.palette.text.primary : theme.palette.action.disabled,
					fontSize: theme.typography.body2.fontSize,
					color: theme.palette.text.secondary,
					backgroundColor: disabled ? theme.palette.action.hover : theme.palette.background.paper,
					cursor: getCursor(),
					borderWidth: isPopoverOpen ? 2 : 1,
				} ) }
			>
				<Box component="span" sx={ ( theme: Theme ) => ( { flex: 1, color: theme.palette.text.primary } ) }>
					{ unit === 'custom' ? String( value ) || '' : '' }
				</Box>
				{ modifiedInputProps.endAdornment }
			</Box>
		);
	}
);

NonEditableInput.displayName = 'NonEditableInput';
