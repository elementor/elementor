import { getImagePromptEnhanced } from '../api';
import usePrompt from './use-prompt';

const usePromptEnhancer = ( prompt, type ) => {
	if ( 'media' !== type ) {
		throw new Error( `Invalid prompt type: ${ type }` );
	}

	const {
		data: enhancedData,
		isLoading: isEnhancing,
		send: enhance,
	} = usePrompt( () => getImagePromptEnhanced( prompt ), prompt );

	return {
		enhance,
		isEnhancing,
		enhancedPrompt: enhancedData?.result,
	};
};

export default usePromptEnhancer;
