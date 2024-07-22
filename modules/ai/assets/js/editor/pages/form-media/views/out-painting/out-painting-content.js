import { Stack } from '@elementor/ui';
import PropTypes from 'prop-types';
import { useRef } from 'react';
import AvatarEditor from 'react-avatar-editor';
import useImageSize from '../../hooks/use-image-size';

const OutPaintingContent = ( {
	scale,
	setMask,
	editImage,
	aspectRatio,
	setImageSize,
	setPosition,
} ) => {
	const cropperRef = useRef();
	const position = useRef( { x: 0.5, y: 0.5 } );
	const { width, height } = useImageSize( aspectRatio );
	let imageSize = { width, height };

	const updateMask = async () => {
		const imageDataURL = await cropperRef.current.getImageScaledToCanvas().toDataURL();
		setMask( imageDataURL );
	};

	const onPositionChange = async ( args ) => {
		position.current = { x: args.x, y: args.y };
		await updateMask();
		setPosition( position.current );
	};

	const onImageChange = async () => {
		imageSize = { width: imageSize.width * scale, height: imageSize.height * scale };
		await updateMask();
		setImageSize( imageSize );
	};
	return (
		<Stack alignItems={ 'center' } spacing={ 0.5 } flexGrow={ 1 }>
			<AvatarEditor
				ref={ cropperRef }
				image={ editImage.url }
				style={ {
					backgroundImage: 'linear-gradient(45deg, #bbb 25%, transparent 25%), linear-gradient(-45deg, #bbb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #bbb 75%), linear-gradient(-45deg, transparent 75%, #bbb 75%)',
					backgroundSize: '20px 20px',
					backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
					outline: '2px dashed #000',
					marginTop: '12px',
				} }
				color={ [ 0, 0, 0, 0.9 ] }
				rotate={ 0 }
				border={ 0 }
				allowZoomOut={ true }
				backgroundColor={ 'transparent' }
				showGrid={ true }
				onImageChange={ onImageChange }
				onPositionChange={ ( args ) => onPositionChange( args ) }
				{ ... {
					width,
					height,
					scale,
				} }
			/>
		</Stack>
	);
};

OutPaintingContent.propTypes = {
	scale: PropTypes.number.isRequired,
	setMask: PropTypes.func.isRequired,
	editImage: PropTypes.object.isRequired,
	aspectRatio: PropTypes.string.isRequired,
	setImageSize: PropTypes.func.isRequired,
	setPosition: PropTypes.func.isRequired,
};

export default OutPaintingContent;
