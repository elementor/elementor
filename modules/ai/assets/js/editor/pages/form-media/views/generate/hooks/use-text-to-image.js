import { getTextToImageGeneration } from '../../../../../api';
import useImagePrompt from '../../../hooks/use-image-prompt';

const useTextToImage = ( initialValue ) => {
	return useImagePrompt( getTextToImageGeneration, initialValue );
};

export default useTextToImage;
