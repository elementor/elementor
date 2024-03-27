import { getImageToImageRemoveBackground } from '../../../../../api';
import useImagePrompt from '../../../hooks/use-image-prompt';

const useRemoveBackground = ( initialValue ) => {
	const fetchAction = ( payload ) => getImageToImageRemoveBackground( payload );

	return useImagePrompt( fetchAction, initialValue );
};

export default useRemoveBackground;
