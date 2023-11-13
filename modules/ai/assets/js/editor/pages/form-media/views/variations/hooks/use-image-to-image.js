import { getImageToImageGeneration } from '../../../../../api';
import useImagePrompt from '../../../hooks/use-image-prompt';

const useImageToImage = ( initialValue ) => {
	const fetchAction = ( prompt, promptSettings, image ) => getImageToImageGeneration( prompt, promptSettings, image );

	return useImagePrompt( fetchAction, initialValue );
};

export default useImageToImage;
