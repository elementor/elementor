import { getImageToImageGeneration } from '../../../../../api';
import useImagePrompt from '../../../hooks/use-image-prompt';

const useImageToImage = ( initialValue ) => {
	const fetchAction = ( payload ) => getImageToImageGeneration( payload );

	return useImagePrompt( fetchAction, initialValue );
};

export default useImageToImage;
