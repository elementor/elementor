import { getTextToImageGeneration, getImageToImageGeneration } from '../api';
import usePrompt from './use-prompt';

const getImageResponse = async ( prompt, promptSettings, image = null ) => {
	const apiMethod = image ? getImageToImageGeneration : getTextToImageGeneration;
	return apiMethod( prompt, promptSettings, image );
}

const useImagePrompt = ( initialValue, image = null ) => {

	const promptData = usePrompt( getImageResponse, initialValue );

	return promptData;
};

export default useImagePrompt;
