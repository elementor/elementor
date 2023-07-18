import { getImagePromptEnhanced } from '../api';
import usePrompt from './use-prompt';

const getResult = async ( prompt ) => {
	return getImagePromptEnhanced( prompt );
};

const useImagePromptEnhancer = ( initialValue ) => {
	const promptData = usePrompt( getResult, initialValue );

	return promptData;
};

export default useImagePromptEnhancer;
