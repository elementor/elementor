import { Stack } from '@elementor/ui';
import { useRef } from 'react';
import AvatarEditor from 'react-avatar-editor';
import { IMAGE_PROMPT_SETTINGS } from '../consts/consts';

const OutPainting = (
	{
		editImage,
		setMaskImage,
		promptSettings,
		viewData,
	},
) => {
	const cropperRef = useRef();

	const { width, height } = viewData;

	const scale = promptSettings[ IMAGE_PROMPT_SETTINGS.ZOOM ] || 1;

	const updateMask = async () => {
		const imageDataURL = await cropperRef.current.getImageScaledToCanvas().toDataURL();
		setMaskImage( imageDataURL );
	};

	return (
		<Stack alignItems={ 'center' } spacing={ 2 } flexGrow={ 1 } sx={ { pt: 9 } }>
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

OutPainting.propTypes = {
	editImage: PropTypes.object.isRequired,
	setMaskImage: PropTypes.func.isRequired,
	promptSettings: PropTypes.object.isRequired,
	viewData: PropTypes.object.isRequired,
};

export default OutPainting;
