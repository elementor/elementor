import { getImageToImageReplaceBackground } from '../../../../../api';
import useImagePrompt from '../../../hooks/use-image-prompt';

const useReplaceBackground = ( initialValue ) => {
	const fetchAction = ( payload ) => getImageToImageReplaceBackground( payload );

	return useImagePrompt( fetchAction, initialValue );
};

export default useReplaceBackground;
