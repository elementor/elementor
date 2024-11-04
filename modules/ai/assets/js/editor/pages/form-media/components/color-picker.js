import { FormLabel, InputAdornment, Popover, styled, Typography } from '@elementor/ui';
import PropTypes from 'prop-types';
import TextField from '@elementor/ui/TextField';
import { useEffect, useRef, useState } from 'react';

const { ColorPicker, ColorIndicator } = wp?.components ?? {};

const ColorInput = ( { label, color, onChange, disabled } ) => {
	const [ isOpened, setIsOpened ] = useState( false );
	const anchorEl = useRef( );
	const [ zIndex, setZIndex ] = useState( 170001 );
	const isRTL = elementorCommon?.config?.isRTL ?? true;

	useEffect( () => {
		if ( anchorEl.current ) {
			let element = anchorEl.current;
			let currentZIndex = 0;

			while ( element && element !== document.body ) {
				const computedZIndex = window.getComputedStyle( element ).zIndex;
				if ( computedZIndex !== 'auto' ) {
					currentZIndex = parseInt( computedZIndex, 10 ) || 0;
					break;
				}
				element = element.parentElement;
			}

			setZIndex( currentZIndex > 0 ? currentZIndex + 1 : 170001 );
		}
	}, [ isOpened ] );

	useEffect( () => {
		if ( anchorEl.current && isOpened ) {
			const timeout = setTimeout( () => {
				const irrelevantComponents = document.querySelector( '.el-ai-custom-color-picker>.components-color-picker > *:not(.react-colorful)' );
				irrelevantComponents?.remove();
			}, 10 );

			return () => clearTimeout( timeout );
		}
	}, [ isOpened ] );

	const handleClick = () => setIsOpened( true );
	const handleClose = () => {
		setIsOpened( false );
	};

	const handleTextFieldChange = ( event ) => {
		onChange( `#${ event.target.value }` );
	};

	const handleColorPickerChange = ( colorValue ) => {
		// Extract the hex value from the color object
		onChange( colorValue.hex );
	};

	const id = isOpened ? 'simple-popover' : undefined;

	return (
		<div
			className="el-ai-color-input-wrapper"
			style={ { display: 'flex', alignItems: 'center', ...( disabled ? { pointerEvents: 'none', opacity: 0.5 } : {} ) } }
		>
			<FormLabel sx={ { whiteSpace: 'nowrap', flex: 4 } }>{ label }</FormLabel>
			<ColorIndicator
				colorValue={ color }
				onClick={ handleClick }
				style={ {
					cursor: 'pointer',
					borderRadius: '4px',
					marginRight: '8px',
					marginLeft: '8px',
					borderColor: 'rgb(12, 13, 14)',
					background: color,
					width: '100%',
					height: 'auto',
					aspectRatio: '1 / 1',
					flex: 1.1,
				} }
				aria-describedby={ id }
				ref={ anchorEl }
			/>
			<StyledTextField
				value={ color.substring( 1, 7 ) }
				color="secondary"
				fullWidth
				InputProps={ {
					autoComplete: 'off',
					color: 'secondary',
					startAdornment: (
						<InputAdornment position="start" >
							<Typography variant="body1" color="secondary">#</Typography>
						</InputAdornment>
					),
				} }
				onChange={ handleTextFieldChange }
				sx={ { flex: 3 } }
			/>
			<Popover
				id={ id }
				anchorOrigin={ {
					vertical: 'bottom',
					horizontal: isRTL ? 'right' : 'left',
				} }
				transformOrigin={ {
					vertical: 'top',
					horizontal: isRTL ? 'right' : 'left',
				} }
				onClose={ handleClose }
				open={ isOpened }
				anchorEl={ anchorEl.current }
				style={ { zIndex } }
			>
				<div className="el-ai-custom-color-picker">
					<ColorPicker
						color={ color }
						onChangeComplete={ handleColorPickerChange }
						disableAlpha={ true }
					/>
				</div>
			</Popover>
		</div>
	);
};

const StyledTextField = styled( TextField )( () => ( {
	'.wp-admin & .MuiInputBase-input, & .MuiInputBase-input:focus': {
		backgroundColor: 'initial',
		boxShadow: 'none',
		border: 0,
		color: 'inherit',
		outline: 0,
		padding: 0,
		fontFamily: 'inherit',
		minHeight: '2.4375em',
	},
} ) );

ColorInput.propTypes = {
	label: PropTypes.string,
	color: PropTypes.string,
	onChange: PropTypes.func.isRequired,
	disabled: PropTypes.bool,
};

export default ColorInput;
