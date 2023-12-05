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
} ) => {
	const cropperRef = useRef();

	const { width, height } = useImageSize( aspectRatio );

	const updateMask = async () => {
		const imageDataURL = await cropperRef.current.getImageScaledToCanvas().toDataURL();
		setMask( imageDataURL );
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
				onImageChange={ () => updateMask() }
				onPositionChange={ () => updateMask() }
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
};

export default OutPaintingContent;
