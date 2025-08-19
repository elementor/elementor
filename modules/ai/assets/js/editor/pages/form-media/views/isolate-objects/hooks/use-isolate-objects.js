import { getImageToImageIsolateObjects } from '../../../../../api';
import useImagePrompt from '../../../hooks/use-image-prompt';

const useIsolateObject = ( initialValue ) => {
	const fetchAction = ( payload ) => getImageToImageIsolateObjects( payload );

	return useImagePrompt( fetchAction, initialValue );
};

export default useIsolateObject;
