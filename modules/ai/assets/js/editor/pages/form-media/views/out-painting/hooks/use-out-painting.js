import { getImageToImageOutPainting } from '../../../../../api';
import useImagePrompt from '../../../hooks/use-image-prompt';

const useOutPainting = ( initialValue ) => {
	const fetchAction = ( prompt, promptSettings, image, mask ) => getImageToImageOutPainting( prompt, promptSettings, image, mask );

	return useImagePrompt( fetchAction, initialValue );
};

export default useOutPainting;
