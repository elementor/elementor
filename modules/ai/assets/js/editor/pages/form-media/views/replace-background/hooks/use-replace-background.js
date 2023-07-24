import { getImageToImageReplaceBackground } from '../../../../../api';
import useImagePrompt from '../../../hooks/use-image-prompt';

const useReplaceBackground = ( initialValue ) => {
	const fetchAction = ( prompt, image ) => getImageToImageReplaceBackground( prompt, image );

	return useImagePrompt( fetchAction, initialValue );
};

export default useReplaceBackground;
