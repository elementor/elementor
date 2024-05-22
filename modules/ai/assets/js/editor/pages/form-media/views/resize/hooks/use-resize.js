import { getImageToImageUpscale } from '../../../../../api';
import useImagePrompt from '../../../hooks/use-image-prompt';

const useResize = ( initialValue ) => {
	const fetchAction = ( payload ) => getImageToImageUpscale( payload );

	return useImagePrompt( fetchAction, initialValue );
};

export default useResize;
