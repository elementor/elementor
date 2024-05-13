import { getImageToImageMaskGeneration } from '../../../../../api';
import useImagePrompt from '../../../hooks/use-image-prompt';

const useInPainting = ( initialValue ) => {
	const fetchAction = ( payload ) => getImageToImageMaskGeneration( payload );

	return useImagePrompt( fetchAction, initialValue );
};

export default useInPainting;
