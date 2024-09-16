import { useRef, useState, useEffect } from 'react';
import {
	Box,
	Button,
	FormControl,
	InputLabel,
	MenuItem,
	Stack,
	Select,
	ListItemIcon,
	ListItemText,
	Tooltip,
	styled,
	withDirection,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import UndoIcon from '../../../../icons/undo-icon';
import RedoIcon from '../../../../icons/redo-icon';

const STROKE_SELECT_WIDTH = 120;

const BRUSH_COLOR = 'rgba(255, 255, 255)';
const CANVAS_COLOR = 'rgba(0, 0, 0)';

const StyledUndoIcon = withDirection( UndoIcon );
const StyledRedoIcon = withDirection( RedoIcon );

const BrushCursor = styled( Box, { shouldForwardProp: ( prop ) => 'size' === prop } )( ( { theme, size } ) => ( {
	position: 'absolute',
	width: size,
	height: size,
	borderRadius: '50%',
	backgroundColor: BRUSH_COLOR,
	pointerEvents: 'none',
	transform: `translate(${ 'rtl' === theme.direction ? '50%' : '-50%' }, -50%)`,
	border: `1px solid #fff`,
} ) );

const BrishSizeIcon = styled( Box, { shouldForwardProp: ( prop ) => 'size' === prop } )( ( { theme, size } ) => ( {
	width: size / 2,
	height: size / 2,
	borderRadius: '50%',
	backgroundColor: theme.palette.secondary.main,
} ) );

const CleanupContent = ( { editImage, setMask, setIsCanvasChanged, width: canvasWidth, height: canvasHeight } ) => {
	const sketchRef = useRef();
	const [ stroke, setStroke ] = useState( 30 );
	const brushCursorRef = useRef();

	useEffect( () => {
		const canvas = document.querySelector( '.eui-in-painting-canvas' );

		// The BrushCursor should follow the mouse position but should stay only inside the canvas.
		const positionElement = ( e ) => {
			const { left, top, width, height } = canvas.getBoundingClientRect();
			const x = e.clientX - left;
			const y = e.clientY - top;

			if ( x > 0 && x < width && y > 0 && y < height ) {
				brushCursorRef.current.style.left = `${ x }px`;
				brushCursorRef.current.style.top = `${ y }px`;
			}
		};

		window.addEventListener( 'mousemove', positionElement );

		return () => {
			window.removeEventListener( 'mousemove', positionElement );
		};
	}, [ stroke ] );

	return (
		<Stack alignItems="flex-start" spacing={ 0.5 } flexGrow={ 1 }>
			<Stack width="100%" direction="row" spacing={ 3 } alignSelf="center" justifyContent="center" sx={ { mb: 2.5 } }>
				<Stack direction="row" gap={ 1 }>
					<Tooltip title={ __( 'Undo', 'elementor' ) }>
						<Button variant="outlined" color="secondary" onClick={ () => sketchRef.current.undo() } sx={ { px: 0 } }>
							<StyledUndoIcon />
						</Button>
					</Tooltip>

					<Tooltip title={ __( 'Redo', 'elementor' ) }>
						<Button variant="outlined" color="secondary" onClick={ () => sketchRef.current.redo() } sx={ { px: 0 } }>
							<StyledRedoIcon />
						</Button>
					</Tooltip>
				</Stack>

				<FormControl size="small" color="secondary" sx={ { minWidth: STROKE_SELECT_WIDTH } }>
					<InputLabel id="stroke">Stroke</InputLabel>

					<Select
						autoWidth
						label="Stroke"
						value={ stroke }
						id="demo-simple-select"
						labelId="demo-simple-select-label"
						onChange={ ( e ) => setStroke( e.target.value ) }
						MenuProps={ {
							PaperProps: {
								sx: {
									maxWidth: STROKE_SELECT_WIDTH,
								},
							},
							MenuListProps: {
								sx: {
									minWidth: STROKE_SELECT_WIDTH,
								},
							},
						} }
						sx={ {
							'& .MuiSelect-select .MuiListItemIcon-root': {
								mr: 0.25,
								width: 'initial',
								minWidth: 'initial',
								justifyContent: 'flex-start',
							},
						} }
					>
						{ [ 10, 20, 30, 40, 50 ].map( ( value ) => (
							<MenuItem key={ 'stroke-width-option-' + value } value={ value }>
								<Stack direction="row" alignItems="center" gap={ 1 }>
									<ListItemIcon sx={ { width: 30, display: 'flex', justifyContent: 'center' } }>
										<BrishSizeIcon size={ value } />
									</ListItemIcon>
									<ListItemText>{ value }</ListItemText>
								</Stack>
							</MenuItem>
						) ) }
					</Select>
				</FormControl>
			</Stack>

			<div
				style={ {
					margin: '0 auto',
					position: 'relative',
					cursor: 'none',
					overflow: 'hidden',
				} }
			>
				<BrushCursor ref={ brushCursorRef } size={ stroke } />

				<ReactSketchCanvas
					className="eui-in-painting-canvas"
					withViewBox={ true }
					ref={ sketchRef }
					height={ canvasHeight + 'px' }
					width={ canvasWidth + 'px' }
					strokeWidth={ stroke }
					strokeColor={ BRUSH_COLOR }
					canvasColor={ CANVAS_COLOR }
					backgroundImage={ editImage.url }
					onStroke={ () => setIsCanvasChanged( true ) }
					onChange={ async () => {
						const svg = await sketchRef.current.exportSvg();
						setMask( svg );
					} }
				/>
			</div>
		</Stack>
	);
};

CleanupContent.propTypes = {
	setMask: PropTypes.func.isRequired,
	setIsCanvasChanged: PropTypes.func.isRequired,
	width: PropTypes.number.isRequired,
	height: PropTypes.number.isRequired,
	editImage: PropTypes.object.isRequired,
};

export default CleanupContent;
