import * as React from 'react';
import { useRef } from 'react';
// import { MathFunctionIcon } from '@elementor/icons';
import { Box, InputAdornment, type PopupState, SvgIcon, type SvgIconProps } from '@elementor/ui';

import ControlActions from '../../control-actions/control-actions';
import { type ExtendedOption, isUnitExtendedOption, type Unit } from '../../utils/size-control';
import { SelectionEndAdornment, TextFieldInnerSelection } from '../size-control/text-field-inner-selection';

const MathFunctionIcon = React.forwardRef< SVGSVGElement, SvgIconProps >( ( props, ref ) => {
	return (
		<SvgIcon viewBox="0 0 17 17" { ...props } ref={ ref }>
			<path d="M8.25 1.57812C8.79701 1.57813 9.32146 1.79558 9.70825 2.18237C10.095 2.56917 10.3125 3.09362 10.3125 3.64062C10.3125 3.95129 10.0607 4.20312 9.75 4.20312C9.43934 4.20312 9.1875 3.95129 9.1875 3.64062C9.1875 3.39198 9.08866 3.1536 8.91284 2.97778C8.75908 2.82402 8.55751 2.72889 8.34302 2.70752L8.25 2.70312C8.11054 2.70312 7.98795 2.7525 7.84131 2.97632C7.67592 3.22885 7.52926 3.63957 7.3916 4.23608C7.2562 4.8229 7.14188 5.52915 7.01221 6.34253C6.91438 6.9562 6.8083 7.62491 6.67969 8.32812H8.25C8.56066 8.32812 8.8125 8.57996 8.8125 8.89062C8.8125 9.20129 8.56066 9.45312 8.25 9.45312H6.46582C6.32297 10.2132 6.20614 10.9386 6.09814 11.616C5.97003 12.4196 5.84991 13.1667 5.7041 13.7986C5.56055 14.4206 5.37895 14.9945 5.09912 15.4216C4.80045 15.8774 4.36045 16.2031 3.75 16.2031C3.20299 16.2031 2.67854 15.9857 2.29175 15.5989C1.90495 15.2121 1.6875 14.6876 1.6875 14.1406C1.6875 13.83 1.93934 13.5781 2.25 13.5781C2.56066 13.5781 2.8125 13.83 2.8125 14.1406C2.8125 14.3893 2.91134 14.6277 3.08716 14.8035C3.26297 14.9793 3.50136 15.0781 3.75 15.0781C3.88946 15.0781 4.01205 15.0288 4.15869 14.8049C4.32408 14.5524 4.47074 14.1417 4.6084 13.5452C4.7438 12.9584 4.85812 12.2521 4.98779 11.4387C5.08562 10.825 5.1917 10.1563 5.32031 9.45312H3.75C3.43934 9.45312 3.1875 9.20129 3.1875 8.89062C3.1875 8.57996 3.43934 8.32812 3.75 8.32812H5.53418C5.67703 7.56809 5.79386 6.84269 5.90186 6.16528C6.02997 5.36164 6.15009 4.61452 6.2959 3.98267C6.43945 3.36069 6.62105 2.78673 6.90088 2.35962C7.19955 1.90385 7.63955 1.57812 8.25 1.57812Z" />
			<path d="M15.3523 8.49292C15.572 8.27329 15.928 8.27328 16.1477 8.49292C16.3673 8.71258 16.3673 9.06866 16.1477 9.28833L14.2954 11.1406L16.1477 12.9929L16.1865 13.0354C16.3667 13.2563 16.3536 13.5824 16.1477 13.7883C15.9418 13.9943 15.6157 14.0074 15.3948 13.8271L15.3523 13.7883L13.5 11.936L11.6477 13.7883C11.428 14.008 11.072 14.008 10.8523 13.7883C10.6326 13.5687 10.6326 13.2126 10.8523 12.9929L12.7046 11.1406L10.8523 9.28833L10.8135 9.24585C10.6333 9.02492 10.6464 8.69884 10.8523 8.49292C11.0582 8.28707 11.3843 8.27398 11.6052 8.4541L11.6477 8.49292L13.5 10.3452L15.3523 8.49292Z" />
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
