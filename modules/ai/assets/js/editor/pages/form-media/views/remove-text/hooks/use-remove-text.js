import { getImageToImageRemoveText } from '../../../../../api';
import useImagePrompt from '../../../hooks/use-image-prompt';

const useRemoveText = ( initialValue ) => {
	const fetchAction = ( image ) => getImageToImageRemoveText( image );

	return useImagePrompt( fetchAction, initialValue );
};

export default useRemoveText;
