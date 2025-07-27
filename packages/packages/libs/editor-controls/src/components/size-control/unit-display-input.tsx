import * as React from 'react';
import { forwardRef } from 'react';
import { type PropValue } from '@elementor/editor-props';
import { type TextFieldProps } from '@elementor/ui';

import { type ExtendedOption, type Unit } from '../../utils/size-control';

type UnitDisplayInputProps = {
	value: PropValue;
	onClick?: ( event: React.MouseEvent< HTMLElement > ) => void;
	disabled?: boolean;
	isPopoverOpen?: boolean;
	unit?: Unit | ExtendedOption;
	inputProps: TextFieldProps[ 'InputProps' ] & {
		endAdornment: React.ReactNode;
	};
};

export const UnitDisplayInput = forwardRef< HTMLDivElement, UnitDisplayInputProps >(
	( { value, onClick, disabled, isPopoverOpen = false, unit, inputProps }, ref ) => {
		const sharedStyles: React.CSSProperties = {
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'space-between',
			height: 28,
			padding: '0 12px',
			borderRadius: 8,
			border: '1px solid',
			borderColor: '#C4C4C4',
			fontSize: '14px',
			color: '#555',
			backgroundColor: disabled ? '#f5f5f5' : '#fff',
			cursor: disabled ? 'default' : unit === 'custom' ? 'pointer' : 'default',
		};

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

		return (
			<div
				ref={ ref }
				onClick={ handleClick }
				style={ {
					...sharedStyles,
					borderColor: isPopoverOpen ? '#000' : sharedStyles.borderColor,
					borderWidth: isPopoverOpen ? '2px' : '1px',
				} }
			>
				<span style={ { flex: 1, color: '#444' } }>{ unit === 'custom' ? String( value ) || '' : '' }</span>
				{ modifiedInputProps.endAdornment }
			</div>
		);
	}
);

UnitDisplayInput.displayName = 'UnitDisplayInput';
