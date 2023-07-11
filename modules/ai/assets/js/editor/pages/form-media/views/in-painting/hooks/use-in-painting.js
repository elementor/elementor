import { getImageToImageMaskGeneration } from '../../../../../api';
import useImagePrompt from '../../../hooks/use-image-prompt';

const useInPainting = ( initialValue ) => {
	const fetchAction = ( prompt, promptSettings, image, mask ) => getImageToImageMaskGeneration( prompt, promptSettings, image, mask );

	return useImagePrompt( fetchAction, initialValue );
};

export default useInPainting;
