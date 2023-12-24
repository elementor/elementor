import { getImageToImageUpscale } from '../../../../../api';
import useImagePrompt from '../../../hooks/use-image-prompt';

const useResize = ( initialValue ) => {
	const fetchAction = ( prompt, promptSettings, image ) => getImageToImageUpscale( prompt, promptSettings, image );

	return useImagePrompt( fetchAction, initialValue );
};

export default useResize;
