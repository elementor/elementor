import * as React from 'react';
import { useRef } from 'react';
import { PencilIcon } from '@elementor/icons';
import { Box, InputAdornment, type PopupState } from '@elementor/ui';

import ControlActions from '../../control-actions/control-actions';
import { type ExtendedOption, isUnitExtendedOption, type Unit } from '../../utils/size-control';
import { SelectionEndAdornment, TextFieldInnerSelection } from '../size-control/text-field-inner-selection';

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
};

const RESTRICTED_INPUT_KEYS = [ 'e', 'E', '+', '-' ];

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
}: SizeInputProps ) => {
	const unitInputBufferRef = useRef( '' );
	const inputType = isUnitExtendedOption( unit ) ? 'text' : 'number';
	const inputValue = ! isUnitExtendedOption( unit ) && Number.isNaN( size ) ? '' : size ?? '';

	const handleKeyUp = ( event: React.KeyboardEvent< HTMLInputElement > ) => {
		const { key } = event;

		if ( ! /^[a-zA-Z%]$/.test( key ) ) {
			return;
		}

		event.preventDefault();

		const newChar = key.toLowerCase();
		const updatedBuffer = ( unitInputBufferRef.current + newChar ).slice( -3 );
		unitInputBufferRef.current = updatedBuffer;

		const matchedUnit =
			units.find( ( u ) => u.includes( updatedBuffer ) ) ||
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

	const inputProps = {
		...popupAttributes,
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
				alternativeOptionLabels={ {
					custom: <PencilIcon fontSize="small" />,
				} }
				menuItemsAttributes={
					units.includes( 'custom' )
						? {
								custom: popupAttributes,
						  }
						: undefined
				}
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
					onKeyDown={ ( event ) => {
						if ( RESTRICTED_INPUT_KEYS.includes( event.key ) ) {
							event.preventDefault();
						}
					} }
					onKeyUp={ handleKeyUp }
					onBlur={ onBlur }
					shouldBlockInput={ isUnitExtendedOption( unit ) }
					inputProps={ inputProps }
				/>
			</Box>
		</ControlActions>
	);
};
