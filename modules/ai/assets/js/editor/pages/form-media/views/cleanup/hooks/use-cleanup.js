import { getImageToImageMaskCleanup } from '../../../../../api';
import useImagePrompt from '../../../hooks/use-image-prompt';

const useCleanup = ( initialValue ) => {
	const fetchAction = ( payload ) => getImageToImageMaskCleanup( payload );

	return useImagePrompt( fetchAction, initialValue );
};

export default useCleanup;
