import {
	getTextToImageGeneration,
	getImageToImageGeneration,
	getImageToImageMaskGeneration,
	getImageToImageOutPainting, getImageToImageUpscale,
} from '../api';
import usePrompt from './use-prompt';
import { PANELS } from '../pages/form-media/consts/consts';

const getImageResponse = async ( prompt, promptSettings, image = null, imageToImageType = null, mask = null ) => {
	let apiMethod = image ? getImageToImageGeneration : getTextToImageGeneration;
	if ( imageToImageType && PANELS.IN_PAINTING === imageToImageType ) {
		apiMethod = getImageToImageMaskGeneration;
	}
	if ( imageToImageType && PANELS.OUT_PAINTING === imageToImageType ) {
		apiMethod = getImageToImageOutPainting;
	}

	if ( imageToImageType && PANELS.UPSCALE === imageToImageType ) {
		apiMethod = getImageToImageUpscale;
	}
	return apiMethod( prompt, promptSettings, image, mask );
};

const useImagePrompt = ( initialValue ) => {
	const promptData = usePrompt( getImageResponse, initialValue );

	return promptData;
};

export default useImagePrompt;
