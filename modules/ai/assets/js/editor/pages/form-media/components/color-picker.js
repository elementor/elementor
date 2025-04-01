import { FormLabel, InputAdornment, Popover, styled, Typography } from '@elementor/ui';
import PropTypes from 'prop-types';
import TextField from '@elementor/ui/TextField';
import { useEffect, useRef, useState } from 'react';
import { HexColorPicker } from 'react-colorful';

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

	const handleClick = () => setIsOpened( true );
	const handleClose = () => {
		setIsOpened( false );
	};

	const handleKeyDown = ( event ) => {
		if ( 'Enter' === event.key || ' ' === event.key ) {
			event.preventDefault();
			handleClick();
		}
	};

	const handleTextFieldChange = ( event ) => {
		onChange( `#${ event.target.value }` );
	};

	const handleColorPickerChange = ( colorValue ) => {
		onChange( colorValue );
	};

	const id = isOpened ? 'simple-popover' : undefined;

	return (
		<div
			className="el-ai-color-input-wrapper"
			style={ { display: 'flex', alignItems: 'center', ...( disabled ? { pointerEvents: 'none', opacity: 0.5 } : {} ) } }
		>
			<FormLabel sx={ { whiteSpace: 'nowrap', flex: 4 } }>{ label }</FormLabel>
			<button
				type="button"
				onClick={ handleClick }
				onKeyDown={ handleKeyDown }
				style={ {
					cursor: 'pointer',
					borderRadius: '4px',
					marginRight: '8px',
					marginLeft: '8px',
					background: color,
					width: '100%',
					height: 'auto',
					borderColor: 'rgba(0, 0, 0, 0.23)',
					borderWidth: '1px',
					borderStyle: 'solid',
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
					sx: {
						height: '100%',
					},
					startAdornment: (
						<InputAdornment position="start" >
							<Typography variant="body1" color="secondary">#</Typography>
						</InputAdornment>
					),
				} }
				onChange={ handleTextFieldChange }
				sx={ {
					flex: 3,
					height: '40px',
				} }
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
				style={ { zIndex, overflow: 'hidden' } }
			>
				<div className="el-ai-custom-color-picker" style={ { height: 'min-content', overflow: 'hidden' } }>
					<HexColorPicker
						color={ color }
						onChange={ handleColorPickerChange }
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
