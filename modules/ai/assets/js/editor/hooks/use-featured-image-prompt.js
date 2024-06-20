import { getFeaturedImage } from '../api';
import useImagePrompt from '../pages/form-media/hooks/use-image-prompt';

const useFeaturedImagePrompt = ( initialValue ) => {
	return useImagePrompt( async ( payload ) => getFeaturedImage( payload ), initialValue );
};

export default useFeaturedImagePrompt;
