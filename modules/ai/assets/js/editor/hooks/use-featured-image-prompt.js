import usePrompt from './use-prompt';
import { getFeaturedImage } from '../api';

const useFeaturedImagePrompt = ( initialValue ) => {
	return usePrompt( async ( payload ) => getFeaturedImage( payload ), initialValue );
};

export default useFeaturedImagePrompt;
