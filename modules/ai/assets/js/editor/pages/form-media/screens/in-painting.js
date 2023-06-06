import { Box, Button, ButtonGroup, FormControl, InputLabel, MenuItem, Stack, Select } from '@elementor/ui';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import { useRef, useState } from 'react';

const InPainting = (
	{
		editImage,
		setMaskImage,
	},
) => {
	const sketchRef = useRef();
	const [ stroke, setStroke ] = useState( 6 );
	return (
		<Stack alignItems="flex-start" spacing={ 2 } flexGrow={ 1 }>
			<Stack direction="row" spacing={ 6 } alignSelf="center" alignItems="center">
				<ButtonGroup variant="contained" aria-label="outlined primary button group">
					<Button onClick={ () => sketchRef.current.undo() }>Undo</Button>
					<Button onClick={ () => sketchRef.current.redo() }>Redo</Button>
				</ButtonGroup>
				<FormControl fullWidth>
					<InputLabel id="stroke">Stroke</InputLabel>
					<Select
						labelId="demo-simple-select-label"
						id="demo-simple-select"
						value={ stroke }
						label="Stroke"
						onChange={ ( e ) => setStroke( e.target.value ) }
					>
						{ [ 1, 5, 10, 15, 20, 25 ].map( ( value ) => <MenuItem value={ value }>{ value }</MenuItem> ) }
					</Select>
				</FormControl>
			</Stack>
			<div style={ {
				width: '512px',
				height: '512px',
				margin: '0 auto',
			} }>
				<ReactSketchCanvas
					withViewBox={ true }
					ref={ sketchRef }
					height={ '40em' }
					width={ '40em' }
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
};

export default InPainting;
