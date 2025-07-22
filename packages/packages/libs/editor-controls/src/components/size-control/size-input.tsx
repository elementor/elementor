import * as React from 'react';
import { useRef } from 'react';
// import { MathFunctionIcon } from '@elementor/icons';
import { Box, InputAdornment, type PopupState, SvgIcon, type SvgIconProps } from '@elementor/ui';

import ControlActions from '../../control-actions/control-actions';
import { type ExtendedOption, isUnitExtendedOption, type Unit } from '../../utils/size-control';
import { SelectionEndAdornment, TextFieldInnerSelection } from '../size-control/text-field-inner-selection';

const MathFunctionIcon = React.forwardRef< SVGSVGElement, SvgIconProps >( ( props, ref ) => {
	return (
		<SvgIcon viewBox="0 0 24 24" { ...props } ref={ ref }>
			<path d="M11 2.25C11.7293 2.25 12.4286 2.53994 12.9443 3.05566C13.4601 3.57139 13.75 4.27065 13.75 5C13.75 5.41421 13.4142 5.75 13 5.75C12.5858 5.75 12.25 5.41421 12.25 5C12.25 4.66848 12.1182 4.35063 11.8838 4.11621C11.6788 3.9112 11.41 3.78436 11.124 3.75586L11 3.75C10.814 3.75 10.6506 3.81583 10.4551 4.11426C10.2346 4.45097 10.039 4.99859 9.85547 5.79395C9.67493 6.57636 9.5225 7.51803 9.34961 8.60254C9.21917 9.42077 9.07773 10.3124 8.90625 11.25H11C11.4142 11.25 11.75 11.5858 11.75 12C11.75 12.4142 11.4142 12.75 11 12.75H8.62109C8.43063 13.7634 8.27485 14.7306 8.13086 15.6338C7.96004 16.7053 7.79989 17.7015 7.60547 18.5439C7.41407 19.3732 7.17193 20.1385 6.79883 20.708C6.4006 21.3157 5.81393 21.75 5 21.75C4.27065 21.75 3.57139 21.4601 3.05566 20.9443C2.53994 20.4286 2.25 19.7293 2.25 19C2.25 18.5858 2.58579 18.25 3 18.25C3.41421 18.25 3.75 18.5858 3.75 19C3.75 19.3315 3.88179 19.6494 4.11621 19.8838C4.35063 20.1182 4.66848 20.25 5 20.25C5.18595 20.25 5.3494 20.1842 5.54492 19.8857C5.76544 19.549 5.96099 19.0014 6.14453 18.2061C6.32507 17.4236 6.4775 16.482 6.65039 15.3975C6.78083 14.5792 6.92227 13.6876 7.09375 12.75H5C4.58579 12.75 4.25 12.4142 4.25 12C4.25 11.5858 4.58579 11.25 5 11.25H7.37891C7.56937 10.2366 7.72515 9.26942 7.86914 8.36621C8.03996 7.29469 8.20011 6.29853 8.39453 5.45605C8.58593 4.62675 8.82807 3.86147 9.20117 3.29199C9.5994 2.6843 10.1861 2.25 11 2.25Z" />
			<path d="M20.4697 11.4697C20.7626 11.1769 21.2374 11.1769 21.5303 11.4697C21.8231 11.7626 21.8231 12.2374 21.5303 12.5303L19.0605 15L21.5303 17.4697L21.582 17.5264C21.8223 17.8209 21.8048 18.2557 21.5303 18.5303C21.2557 18.8049 20.8209 18.8223 20.5264 18.582L20.4697 18.5303L18 16.0605L15.5303 18.5303C15.2374 18.8231 14.7626 18.8231 14.4697 18.5303C14.1769 18.2374 14.1769 17.7626 14.4697 17.4697L16.9395 15L14.4697 12.5303L14.418 12.4736C14.1778 12.1791 14.1952 11.7443 14.4697 11.4697C14.7443 11.1953 15.1791 11.1778 15.4736 11.418L15.5303 11.4697L18 13.9395L20.4697 11.4697Z" />
		</SvgIcon>
	);
} );

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
					custom: <MathFunctionIcon fontSize="tiny" />,
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
