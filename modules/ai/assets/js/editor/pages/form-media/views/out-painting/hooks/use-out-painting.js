import { getImageToImageOutPainting } from '../../../../../api';
import useImagePrompt from '../../../hooks/use-image-prompt';

const useOutPainting = ( initialValue ) => {
	const fetchAction = ( payload ) => getImageToImageOutPainting( payload );

	return useImagePrompt( fetchAction, initialValue );
};

export default useOutPainting;
