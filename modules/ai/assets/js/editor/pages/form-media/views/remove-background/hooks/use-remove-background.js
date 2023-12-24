import { getImageToImageRemoveBackground } from '../../../../../api';
import useImagePrompt from '../../../hooks/use-image-prompt';

const useRemoveBackground = ( initialValue ) => {
	const fetchAction = ( image ) => getImageToImageRemoveBackground( image );

	return useImagePrompt( fetchAction, initialValue );
};

export default useRemoveBackground;
