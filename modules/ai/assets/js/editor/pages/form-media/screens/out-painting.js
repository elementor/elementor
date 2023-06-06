import { Box, Button, ButtonGroup, Stack } from '@elementor/ui';
import { useRef, useState } from 'react';
import AvatarEditor from 'react-avatar-editor'
import { IMAGE_ASPECT_RATIO_DIMENSIONS, IMAGE_PROMPT_SETTINGS } from '../consts/consts';

const OutPainting = (
	{
		editImage,
		setMaskImage,
		promptSettings,
	},
) => {
	const cropperRef = useRef();
	const scale = promptSettings[ IMAGE_PROMPT_SETTINGS.ZOOM ] || 1;
	const getDimensionsFromAspectRatio = ( aspectRatio ) => {
		const { width, height } = IMAGE_ASPECT_RATIO_DIMENSIONS[ aspectRatio ] || { width: 512, height: 512 };
		return { width, height };
	};

	const { width, height } = getDimensionsFromAspectRatio( promptSettings[ IMAGE_PROMPT_SETTINGS.ASPECT_RATIO ] );
	const updateMask = async () => {
		const imageDataURL = await cropperRef.current.getImageScaledToCanvas().toDataURL();
		setMaskImage( imageDataURL );
	}
	return (
		<Stack alignItems={ 'center' } spacing={ 2 } flexGrow={ 1 }>
			<AvatarEditor
				ref={ cropperRef }
				image={ editImage.url }
				style={ {
					backgroundImage: 'linear-gradient(45deg, rgb(204, 204, 204) 25%, transparent 25%), linear-gradient(-45deg, rgb(204, 204, 204) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgb(204, 204, 204) 75%), linear-gradient(-45deg, transparent 75%, rgb(204, 204, 204) 75%)',
					backgroundSize: '10px 10px',
					outline: '2px dashed #000',
					marginTop: '12px',
				} }
				color={ [ 0, 0, 0, 0.9 ] } // RGBA
				rotate={ 0 }
				border={ 0 }
				allowZoomOut={ true }
				backgroundColor={ 'transparent' }
				showGrid={ true }
				onImageChange={ ( e ) => updateMask() }
				onPositionChange={ ( e ) => updateMask() }
				{ ... {
					width,
					height,
					scale,
				} }
			/>
		</Stack>
	);
};

OutPainting.propTypes = {
	editImage: PropTypes.object.isRequired,
	setMaskImage: PropTypes.func.isRequired,
	promptSettings: PropTypes.object.isRequired,
};

export default OutPainting;
