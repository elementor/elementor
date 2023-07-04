import { getImagePromptEnhanced } from '../../../api';
import usePrompt from '../../../hooks/use-prompt';

const getResult = ( prompt ) => {
	return getImagePromptEnhanced( prompt );
};

const usePromptEnhancer = ( prompt ) => {
	const { data: enhancedData, isLoading: isEnhancing, send: enhance } = usePrompt( () => getResult( prompt ), prompt );

	return {
		enhance,
		isEnhancing,
		enhancedPrompt: enhancedData?.result,
	};
};

export default usePromptEnhancer;
