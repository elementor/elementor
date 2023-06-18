import { useRef, useState, useEffect } from 'react';
import { Box, Button, FormControl, InputLabel, MenuItem, Stack, Select, ListItemIcon, ListItemText, Tooltip, styled } from '@elementor/ui';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import UndoIcon from '../../../icons/undo-icon';
import RedoIcon from '../../../icons/redo-icon';

const STROKE_SELECT_WIDTH = 120;

const BrushCursor = styled( Box, { shouldForwardProp: ( prop ) => 'size' === prop } )( ( { theme, size } ) => ( {
	position: 'absolute',
	width: size,
	height: size,
	borderRadius: '50%',
	backgroundColor: theme.palette.common.black,
	pointerEvents: 'none',
	transform: `translate(${ 'rtl' === theme.direction ? '50%' : '-50%' }, -50%)`,
} ) );

const BrishSizeIcon = styled( Box, { shouldForwardProp: ( prop ) => 'size' === prop } )( ( { theme, size } ) => ( {
	width: size / 2,
	height: size / 2,
	borderRadius: '50%',
	backgroundColor: theme.palette.secondary.main,
} ) );

const InPainting = ( { editImage, setMaskImage, viewData } ) => {
	const sketchRef = useRef();
	const [ stroke, setStroke ] = useState( 30 );

	const brushCursorRef = useRef();

	const { width: canvasWidth, height: canvasHeight } = viewData;

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
		<Stack alignItems="flex-start" spacing={ 2 } flexGrow={ 1 } sx={ { pt: 9 } }>
			<Stack width="100%" direction="row" spacing={ 7 } alignSelf="center" justifyContent="center" sx={ { mb: 6 } }>
				<Stack direction="row" gap={ 3 }>
					<Tooltip title="Undo">
						<Button variant="outlined" color="secondary" onClick={ () => sketchRef.current.undo() } sx={ { px: 0 } }>
							<UndoIcon />
						</Button>
					</Tooltip>

					<Tooltip title="Redo">
						<Button variant="outlined" color="secondary" onClick={ () => sketchRef.current.redo() } sx={ { px: 0 } }>
							<RedoIcon />
						</Button>
					</Tooltip>
				</Stack>
				<FormControl sx={ { minWidth: STROKE_SELECT_WIDTH } }>
					<InputLabel id="stroke">Stroke</InputLabel>
					<Select
						autoWidth
						label="Stroke"
						value={ stroke }
						color="secondary"
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
								mr: 1,
								width: 'initial',
								minWidth: 'initial',
								justifyContent: 'flex-start',
							},
						} }
					>
						{ [ 10, 20, 30, 40, 50 ].map( ( value ) => (
							<MenuItem key={ 'stroke-width-option-' + value } value={ value }>
								<Stack direction="row" alignItems="center" gap={ 3 }>
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
			<div style={ {
				margin: '0 auto',
				position: 'relative',
				cursor: 'none',
				overflow: 'hidden',
			} }>
				<BrushCursor ref={ brushCursorRef } size={ stroke } />
				<ReactSketchCanvas
					className="eui-in-painting-canvas"
					withViewBox={ true }
					ref={ sketchRef }
					height={ canvasHeight + 'px' }
					width={ canvasWidth + 'px' }
					strokeWidth={ stroke }
					strokeColor={ 'black' }
					backgroundImage={ editImage.url }
					onChange={ async () => {
						const svg = await sketchRef.current.exportSvg();
						setMaskImage( svg );
					} }
				/>
			</div>
		</Stack>
	);
};

InPainting.propTypes = {
	editImage: PropTypes.object.isRequired,
	setMaskImage: PropTypes.func.isRequired,
	promptSettings: PropTypes.object.isRequired,
	viewData: PropTypes.object.isRequired,
};

export default InPainting;
