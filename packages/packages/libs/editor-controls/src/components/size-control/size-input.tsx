import * as React from 'react';
import { useEffect, useRef } from 'react';
import { MathFunctionIcon } from '@elementor/icons';
import { Box, InputAdornment, type PopupState } from '@elementor/ui';

import ControlActions from '../../control-actions/control-actions';
import { type ExtendedOption, isUnitExtendedOption, type Unit } from '../../utils/size-control';
import { SelectionEndAdornment, TextFieldInnerSelection } from '../size-control/text-field-inner-selection';

function useTypingBuffer( { timeout = 800 } : { timeout: number } ) {
	const inputBufferRef = useRef( '' );
	const timeoutRef = useRef< number | null >( null );

	const appendKey = ( key: string ) => {
		inputBufferRef.current = ( inputBufferRef.current + key ).slice( -3 );

		if ( timeoutRef.current ) {
			window.clearTimeout( timeoutRef.current );
		}

		timeoutRef.current = window.setTimeout( () => {
			inputBufferRef.current = '';
		}, timeout );

		return inputBufferRef.current;
	};

	useEffect( () => {
		return () => {
			inputBufferRef.current = '';
			if ( timeoutRef.current ) {
				window.clearTimeout( timeoutRef.current );
				timeoutRef.current = null;
			}
		};
	}, [] );

	return {
		buffer: inputBufferRef.current,
		appendKey,
	};
}

type SizeInputProps = {
	unit: Unit | ExtendedOption;
	size: number | string;
	placeholder?: string;
	startIcon?: React.ReactNode;
	units: ( Unit | ExtendedOption )[];
	onBlur?: ( event: React.FocusEvent< HTMLInputElement > ) => void;
	onFocus?: ( event: React.FocusEvent< HTMLInputElement > ) => void;
	onClick?: ( event: React.MouseEvent< HTMLInputElement > ) => void;
	handleUnitChange: ( unit: Unit | ExtendedOption ) => void;
	handleSizeChange: ( event: React.ChangeEvent< HTMLInputElement > ) => void;
	popupState: PopupState;
	disabled?: boolean;
	min?: number;
	id?: string;
	ariaLabel?: string;
};

export const SizeInput = ( {
	units,
	handleUnitChange,
	handleSizeChange,
	placeholder,
	startIcon,
	onBlur,
	onFocus,
	onClick,
	size,
	unit,
	popupState,
	disabled,
	min,
	id,
	ariaLabel,
}: SizeInputProps ) => {
	const { appendKey } = useTypingBuffer();

	const inputType = isUnitExtendedOption( unit ) ? 'text' : 'number';
	const inputValue = ! isUnitExtendedOption( unit ) && Number.isNaN( size ) ? '' : size ?? '';

	const handleKeyDown = ( event: React.KeyboardEvent< HTMLInputElement > ) => {
		const { key, altKey, ctrlKey, metaKey } = event;

		if ( altKey || ctrlKey || metaKey ) {
			return;
		}

		if ( isUnitExtendedOption( unit ) && ! isNaN( Number( key ) ) ) {
			const defaultUnit = units?.[0];
			defaultUnit && handleUnitChange( units?.[0] );
			return;
		}

		if ( ! /^[a-zA-Z%]$/.test( key ) ) {
			return;
		}

		event.preventDefault();

		const newChar = key.toLowerCase();
		const updatedBuffer = appendKey( newChar );

		const matchedUnit =
			units.find( ( u ) => u.startsWith( updatedBuffer ) ) ||
			units.find( ( u ) => u.startsWith( newChar ) ) ||
			units.find( ( u ) => u.includes( newChar ) );

		if ( matchedUnit ) {
			handleUnitChange( matchedUnit );
		}
	};

	const popupAttributes = {
		'aria-controls': popupState.isOpen ? popupState.popupId : undefined,
		'aria-haspopup': true,
	};

	const menuItemsAttributes = units.includes( 'custom' )
		? {
				custom: popupAttributes,
		  }
		: undefined;

	const alternativeOptionLabels = {
		custom: <MathFunctionIcon fontSize="tiny" />,
	};

	const InputProps = {
		...popupAttributes,
		readOnly: isUnitExtendedOption( unit ),
		autoComplete: 'off',
		onClick,
		onFocus,
		startAdornment: startIcon ? (
			<InputAdornment position="start" disabled={ disabled }>
				{ startIcon }
			</InputAdornment>
		) : undefined,
		endAdornment: (
			<SelectionEndAdornment
				disabled={ disabled }
				options={ units }
				onClick={ handleUnitChange }
				value={ unit }
				alternativeOptionLabels={ alternativeOptionLabels }
				menuItemsAttributes={ menuItemsAttributes }
			/>
		),
	};

	return (
		<ControlActions>
			<Box>
				<TextFieldInnerSelection
					disabled={ disabled }
					placeholder={ placeholder }
					type={ inputType }
					value={ inputValue }
					onChange={ handleSizeChange }
					onKeyDown={ handleKeyDown }
					onBlur={ onBlur }
					InputProps={ InputProps }
					inputProps={ { min, step: 'any', 'aria-label': ariaLabel } }
					isPopoverOpen={ popupState.isOpen }
					id={ id }
				/>
			</Box>
		</ControlActions>
	);
};
